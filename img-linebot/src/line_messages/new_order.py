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
    update_user_states(user_id, state="ask_quantity")

    group_id = get_user_states(user_id)["state"]["grp"]
    try:
        group = requests.get(f'http://crm-api/db/groups/{group_id}').json()
        prod = requests.get(f"http://crm-api/db/products/{group['product_id']}").json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return

    prod_min_order_per_person = group["min_qty_pp"] if group["min_qty_pp"] else 1
    prod_max_order_per_person = group["max_qty_pp"] if group["max_qty_pp"] else 20


    quick_reply_btns = [QuickReplyButton(action=MessageAction(label="取消訂單", text="取消訂單"))]
    for i in range(prod_min_order_per_person, prod_max_order_per_person + 1):
            quick_reply_btns.append(QuickReplyButton(action=MessageAction(label=str(i), text=str(i))))
    msg = TextSendMessage(
        text = f"請問您想要下訂多少數量的\n[{prod["name"]}]?\n\n"
                + f"每人最少訂購數: {group["min_qty_pp"]}\n"
                + f"每人最多訂購數: {group["max_qty_pp"]}\n"
                + f"\n(請輸入數字)",
        quick_reply = QuickReply(items=quick_reply_btns)
    )
    reply_msg(event, msg)

def updateQuantity(event):
    user_id = event.source.user_id
    
    group_id = get_user_states(user_id)["state"]["grp"]
    try:
        group = requests.get(f'http://crm-api/db/groups/{group_id}').json()
        prod = requests.get(f"http://crm-api/db/products/{group['product_id']}").json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return

    prod_min_order_per_person = group["min_qty_pp"] if group["min_qty_pp"] else 1
    prod_max_order_per_person = group["max_qty_pp"] if group["max_qty_pp"] else 20

    if isInteger(event.message.text) and isInRange(event.message.text, group["min_qty_pp"], group["max_qty_pp"]):
        update_user_states(user_id, state="get_quantity", qty=event.message.text)
        orderConfirm(event)
    else:
        quick_reply_btns = [QuickReplyButton(action=MessageAction(label="取消訂單", text="取消訂單"))]
        for i in range(prod_min_order_per_person, prod_max_order_per_person + 1):
            quick_reply_btns.append(QuickReplyButton(action=MessageAction(label=str(i), text=str(i))))
        msg = TextSendMessage(
            text = f"錯誤數量格式，請重新輸入!\n\n"
                + f"請問您想要下訂多少數量的\n[{prod["name"]}]?\n\n"
                + f"每人最少訂購數: {group["min_qty_pp"]}\n"
                + f"每人最多訂購數: {group["max_qty_pp"]}\n"
                + f"\n(請輸入數字)",
            quick_reply = QuickReply(items=quick_reply_btns)
        )
        reply_msg(event, msg)

def orderConfirm(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="order_confirm")

    user_state = get_user_states(user_id)
    try:
        group = requests.get(f'http://crm-api/db/groups/{user_state["state"]["grp"]}').json()
        prod = requests.get(f"http://crm-api/db/products/{group['product_id']}").json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return

    msg = TextSendMessage(
        text = f"訂單確認\n\n-商品名稱: {prod["name"]}\n"
                + f"-商品單價: {group["selling_price"]}\n"
                + f"-購買數量: {user_state["state"]['qty']}\n"
                + f"-總金額: ${group["selling_price"] * int(user_state["state"]['qty'])}\n\n"
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

# def generate_order_number():
#     characters = string.ascii_letters + string.digits
#     return ''.join(random.choices(characters, k=8))

def placeOrder(event):

    user_id = event.source.user_id

    user_state = get_user_states(user_id)
    try:
        group = requests.get(f'http://crm-api/db/groups/{user_state["state"]["grp"]}').json()
        prod = requests.get(f"http://crm-api/db/products/{group['product_id']}").json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return

    order_info = {"customer_id": user_id, "group_id": user_state["state"]["grp"], "qty": user_state["state"]["qty"]}
    response = requests.post("http://crm-api/db/orders", json=order_info)
    return response.status_code == 201

def orderConfirmed(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="order_confirmed")
    if placeOrder(event):
        reply_msg(event, "訂單已確認！ 感謝您！")
    else:
        reply_msg(event, "非常抱歉，訂單送出失敗！")


def orderCanceled(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="order_canceled")
    reply_msg(event, "訂單已取消")
