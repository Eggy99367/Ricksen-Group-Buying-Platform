from src.sheet import *
from src.services_ids import *
import src.global_vars
from src.line_messages.input_validation import isInteger, isInRange
from linebot.models import *
import re
import pytz
import random
import string

def askQuantity(event):
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "ask_quantity"
    update_user_states()

    product_name = src.global_vars.user_states[user_id]["prod"]
    prod_row = getProductRow(getSheetData(), product_name)
    prod_min_order_per_person = prod_row[src.global_vars.master_cols[MASTER_PROD_MIN_ORDER_PER_PERSON_COL_NAME]]
    prod_max_order_per_person = prod_row[src.global_vars.master_cols[MASTER_PROD_MAX_ORDER_PER_PERSON_COL_NAME]]

    ssData = getSheetData()
    if not productExist(ssData, product_name):
        reply_msg(event, f"抱歉，商品[{product_name}]不存在！")
        return
    elif not productAvailable(ssData, product_name):
        reply_msg(event, f"抱歉，商品[{product_name}]目前並不開放下單！")
        return
    msg = TextSendMessage(
        text = f"請問您想要下訂多少數量的\n[{product_name}]?\n\n"
                + f"每人最少訂購數: {prod_min_order_per_person}\n"
                + f"每人最多訂購數: {prod_max_order_per_person}\n"
                + f"\n(請輸入數字)",
        quick_reply = QuickReply(items=[QuickReplyButton(action=MessageAction(label="取消訂單", text="取消訂單"))])
    )
    reply_msg(event, msg)

def updateQuantity(event):
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "get_quantity"
    product_name = src.global_vars.user_states[user_id]["prod"]
    prod_row = getProductRow(getSheetData(), product_name)
    prod_min_order_per_person = prod_row[src.global_vars.master_cols[MASTER_PROD_MIN_ORDER_PER_PERSON_COL_NAME]]
    prod_max_order_per_person = prod_row[src.global_vars.master_cols[MASTER_PROD_MAX_ORDER_PER_PERSON_COL_NAME]]

    if isInteger(event.message.text) and isInRange(event.message.text, prod_min_order_per_person, prod_max_order_per_person):
        src.global_vars.user_states[user_id]["quantity"] = event.message.text
        update_user_states()
        orderConfirm(event)
    else:
        src.global_vars.user_states[user_id]["state"] = "ask_quantity"
        msg = TextSendMessage(
            text = f"錯誤數量格式，請重新輸入!\n\n"
                + f"請問您想要下訂多少數量的\n[{product_name}]?\n\n"
                + f"每人最少訂購數: {prod_min_order_per_person}\n"
                + f"每人最多訂購數: {prod_max_order_per_person}\n"
                + f"\n(請輸入數字)",
            quick_reply = QuickReply(items=[QuickReplyButton(action=MessageAction(label="取消訂單", text="取消訂單"))])
        )
        reply_msg(event, msg)

def orderConfirm(event):
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "order_confirm"
    update_user_states()

    user_state = src.global_vars.user_states[user_id]
    product_name = user_state["prod"]
    ssData = getSheetData()
    if not productExist(ssData, product_name):
        reply_msg(event, f"抱歉，商品[{product_name}]不存在！")
        return
    elif not productAvailable(ssData, product_name):
        reply_msg(event, f"抱歉，商品[{product_name}]目前並不開放下單！")
        return
    product_info = getProductRow(ssData, product_name)
    prod_price = product_info[src.global_vars.master_cols[MASTER_PROD_PRICE_COL_NAME]]
    prod_price_int = int(re.search(r'\d+', prod_price).group())
    msg = TextSendMessage(
        text = f"訂單確認\n\n-商品名稱: {product_name}\n"
                + f"-商品單價: {prod_price}\n"
                + f"-購買數量: {user_state['quantity']}\n"
                + f"-總金額: ${prod_price_int * int(user_state['quantity'])}\n\n"
                + f"訂購人資訊：\n\n"
                + f"-姓名: {user_state['name']}\n"
                + f"-電子郵件信箱: {user_state['email']}\n"
                + f"-電話號碼: {user_state['phone']}\n\n"
                + f"請問以上資訊是否正確？",
        quick_reply = QuickReply(items=[
                QuickReplyButton(action=MessageAction(label="確認資訊無誤，確認訂單", text="確認資訊無誤，確認訂單")),
                QuickReplyButton(action=MessageAction(label="取消訂單", text="取消訂單"))
            ]
        )
    )
    # print(event.source.userId)
    reply_msg(event, msg)

def generate_order_number():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=8))

def placeOrder(event):
    ssData = getSheetData()
    user_id = event.source.user_id
    product_info = getProductRow(ssData, src.global_vars.user_states[user_id]["prod"])
    productSheetId = product_info[src.global_vars.master_cols[MASTER_PROD_SHEET_ID_COL_NAME]]
    
    order_number = generate_order_number()
    taiwan_tz = pytz.timezone('Asia/Taipei')
    cur_time = datetime.now(taiwan_tz).strftime("%Y-%m-%d %H:%M:%S")
    user_name = src.global_vars.user_states[user_id]['name']
    user_phone = src.global_vars.user_states[user_id]['phone']
    user_email = src.global_vars.user_states[user_id]['email']
    user_quantity = int(src.global_vars.user_states[user_id]['quantity'])
    prod_name = product_info[src.global_vars.master_cols[MASTER_PROD_NAME_COL_NAME]]
    prod_id = product_info[src.global_vars.master_cols[MASTER_PROD_ID_COL_NAME]]
    prod_price = product_info[src.global_vars.master_cols[MASTER_PROD_PRICE_COL_NAME]]
    total_price = int(re.search(r'\d+', prod_price).group()) * int(src.global_vars.user_states[user_id]['quantity'])

    row_num = len(get_range(productSheetId, PRODUCT_ORDER_SHEET_NAME, (0, 0), (9000000, 0)))
    order_data = [order_number, cur_time, user_id, user_name, user_phone, user_email, user_quantity, total_price]
    edit_range(productSheetId, PRODUCT_ORDER_SHEET_NAME, (row_num, 0), (row_num, 7), [order_data])

    master_row_num = len(get_range(MASTER_SHEET_ID, MASTER_ORDER_SHEET_NAME, (0, 0), (9000000, 0)))
    master_order_data = [order_number, prod_name, prod_id, cur_time, user_id, user_name, user_phone, user_email, user_quantity, total_price]
    edit_range(MASTER_SHEET_ID, MASTER_ORDER_SHEET_NAME, (master_row_num, 0), (master_row_num, 9), [master_order_data])
    return validateOrder(productSheetId, order_number)

def validateOrder(productSheetId, order_number):
    valid = False
    psData = get_range(productSheetId, PRODUCT_ORDER_SHEET_NAME, (0, 0), (9000000, 0))
    for row in psData:
        if row[0] == order_number:
            valid = True
    if not valid:
        return False
    psData = get_range(MASTER_SHEET_ID, MASTER_ORDER_SHEET_NAME, (0, 0), (9000000, 0))
    for row in psData:
        if row[0] == order_number:
            return True
    return False

def orderConfirmed(event):
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "order_confirmed"
    update_user_states()
    if placeOrder(event):
        reply_msg(event, "訂單已確認！ 感謝您！")
    else:
        reply_msg(event, "非常抱歉，訂單送出失敗！")


def orderCanceled(event):
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "order_canceled"
    update_user_states()
    reply_msg(event, "訂單已取消")
