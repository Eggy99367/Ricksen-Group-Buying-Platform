from src.sheet import *
from src.services_ids import *
from src.line_messages.input_validation import isInteger, isInRange
from linebot.models import *
import re
import pytz
import random
import string

inf = 10000

def askQuantity(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="ask_quantity")

    group_id = get_user_states(user_id)["state"]["grp"]
    try:
        group = requests.get(f'{API_URL}/db/groups/{group_id}').json()
        prod = requests.get(f"{API_URL}/db/products/{group['product_id']}").json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return

    prod_min_order_per_person = group["min_qty_pp"] if group["min_qty_pp"] else 1
    prod_max_order_per_person = group["max_qty_pp"] if group["max_qty_pp"] else inf

    prod_max_order = group["max_qty"] if group["max_qty"] else inf
    total_order = int(requests.get(f'{API_URL}/db/orders/{group_id}/total').json()["total_qty"])
    user_total_order = int(requests.get(f'{API_URL}/db/orders/{group_id}/total/{user_id}').json()["total_qty"])

    user_remain = prod_max_order_per_person - user_total_order

    quick_reply_btns = [QuickReplyButton(action=MessageAction(label="取消訂單", text="取消訂單"))]

    if prod_max_order == inf and prod_max_order_per_person == inf:
        msg = TextSendMessage(  
            text = f"請問您想要下訂多少數量的\n[{prod["name"]}]?\n\n"
                    + f"每人最少訂購數: {prod_min_order_per_person}\n"
                    + f"每人最多訂購數: 無限制\n"
                    + f"\n(請輸入數字)",
            quick_reply = QuickReply(items=quick_reply_btns)
        )
        reply_msg(event, msg)
        return
    if user_remain <= 0:
        update_user_states(user_id, state="order_canceled")
        reply_msg(event, "無法購買")
        return
    if total_order + user_remain > prod_max_order:
        user_remain = prod_max_order - total_order
    if user_total_order > 0 or prod_max_order - total_order < prod_min_order_per_person:
        prod_min_order_per_person = 1

    prod_max_order_per_person = user_remain

    if prod_max_order_per_person - prod_min_order_per_person <= 13:
        for i in range(prod_min_order_per_person, prod_max_order_per_person + 1):
            quick_reply_btns.append(QuickReplyButton(action=MessageAction(label=str(i), text=str(i))))
    msg = TextSendMessage(
        text = f"請問您想要下訂多少數量的\n[{prod["name"]}]?\n\n"
                + f"每人最少訂購數: {prod_min_order_per_person}\n"
                + f"每人最多訂購數: {prod_max_order_per_person}\n"
                + f"\n(請輸入數字)",
        quick_reply = QuickReply(items=quick_reply_btns)
    )
    reply_msg(event, msg)

def updateQuantity(event):
    user_id = event.source.user_id
    
    group_id = get_user_states(user_id)["state"]["grp"]
    try:
        group = requests.get(f'{API_URL}/db/groups/{group_id}').json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return
    
    prod_min_order_per_person = group["min_qty_pp"] if group["min_qty_pp"] else 1
    prod_max_order_per_person = group["max_qty_pp"] if group["max_qty_pp"] else inf

    prod_max_order = group["max_qty"] if group["max_qty"] else inf
    total_order = int(requests.get(f'{API_URL}/db/orders/{group_id}/total').json()["total_qty"])
    user_total_order = int(requests.get(f'{API_URL}/db/orders/{group_id}/total/{user_id}').json()["total_qty"])

    user_remain = prod_max_order_per_person - user_total_order

    if total_order + user_remain > prod_max_order:
        user_remain = prod_max_order - total_order
    if user_total_order > 0 or prod_max_order - total_order < prod_min_order_per_person:
        prod_min_order_per_person = 1

    prod_max_order_per_person = user_remain

    if isInteger(event.message.text) and isInRange(event.message.text, prod_min_order_per_person, prod_max_order_per_person):
        update_user_states(user_id, state="get_quantity", qty=event.message.text)
        orderConfirm(event)
    else:
        msg = TemplateSendMessage(
            alt_text="錯誤數量格式",
            template=ButtonsTemplate(
                text = f"錯誤數量格式，是否要繼續購物？",
                actions = [
                    MessageAction(
                        label = "是，繼續購物",
                        text = "是，繼續購物"
                    ),
                    MessageAction(
                        label = "取消訂單",
                        text = "取消訂單"
                    )
                ]
            )
        )
    update_user_states(user_id, state="wrong_quantity_format")
    reply_msg(event, msg)

def orderConfirm(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="order_confirm")

    user_state = get_user_states(user_id)
    try:
        group = requests.get(f'{API_URL}/db/groups/{user_state["state"]["grp"]}').json()
        prod = requests.get(f"{API_URL}/db/products/{group['product_id']}").json()
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
        group = requests.get(f'{API_URL}/db/groups/{user_state["state"]["grp"]}').json()
        prod = requests.get(f"{API_URL}/db/products/{group['product_id']}").json()
    except:
        reply_msg(event, f"抱歉，商品不存在或不開放下單！")
        return

    order_info = {"customer_id": user_id, "group_id": user_state["state"]["grp"], "qty": user_state["state"]["qty"], "status": "訂單確認"}
    response = requests.post(f"{API_URL}/db/orders", json=order_info)
    total_order = int(requests.get(f'{API_URL}/db/orders/{group["id"]}/total').json()["total_qty"])
    if total_order == group["max_qty"]:
        requests.put(f"{API_URL}/db/groups/{group["id"]}", json={"status": "成團，等待入庫"})
    return response.status_code == 201

def orderConfirmed(event):
    user_id = event.source.user_id
    user_state = get_user_states(user_id)
    update_user_states(user_id, state="order_confirmed")
    if placeOrder(event):
        exist = requests.get(f"{API_URL}/db/views/check_buyer_exist/{user_id}/{user_state["state"]["grp"]}").json()
        if not exist["exists"]:
            requests.post(f"{API_URL}/db/views", json={"customer_id": user_id, "group_id": user_state["state"]["grp"], "view_type": "buy"})
        reply_msg(event, "訂單已確認！ 感謝您！")
    else:
        reply_msg(event, "非常抱歉，訂單送出失敗！")


def orderCanceled(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="order_canceled")
    reply_msg(event, "訂單已取消")

