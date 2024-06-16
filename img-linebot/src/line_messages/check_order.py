from src.sheet import *
from src.services_ids import *
import src.global_vars
from linebot.models import *

def checkOrder(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="check_orders")
    order_res = requests.get(f'http://3.27.144.225:8080/db/orders/by_custid/{user_id}').json()
    customer_info = requests.get(f'http://3.27.144.225:8080/db/customers/{user_id}').json()
    orders = []

    for row in order_res:
        group_id = row['group_id']
        group_info = requests.get(f'http://3.27.144.225:8080/db/groups/{group_id}').json()
        product_id = group_info['product_id']
        product_info = requests.get(f'http://3.27.144.225:8080/db/products/{product_id}').json()

        curr_order = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {"type": "text", "text": "訂購明細:", "weight": "bold", "size": "xl"},
                    {"type": "text", "text": f"姓名： {customer_info['name']}", "margin": "md"},
                    {"type": "text", "text": f"商品名稱: {product_info['name']}", "margin": "md"},
                    {"type": "text", "text": f"訂單編號: {row['id']}", "margin": "md"},
                    {"type": "text", "text": f"購買時間: {row['timestamp']}", "margin": "md"},
                    {"type": "text", "text": f"購買數量：{row['qty']}", "margin": "md"},
                    {"type": "text", "text": f"總計金額: {group_info['selling_price'] * row['qty']}", "margin": "md"},
                    {"type": "text", "text": f"商品狀態: {row['status']}", "margin": "md"}
                ]
            }
        }
        orders.append(curr_order)
    
    if orders:
        flex_message = FlexSendMessage(
            alt_text="訂單明細",
            contents={
                "type": "carousel",
                "contents": orders
            }
        )
        reply_msg(event, flex_message)
    else:
        reply_msg(event, TextSendMessage(text="No orders found for this user."))
