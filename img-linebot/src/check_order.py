from src.sheet import *
from src.services_ids import *
import src.global_vars
from linebot.models import *
from datetime import datetime


def checkOrder(event):
    orderData = get_range(MASTER_SHEET_ID, MASTER_ORDER_SHEET_NAME, (0, 0), (9000000, 9))
    userId = event.source.user_id
    orders = []

    temp_order_data = []
    for row in orderData:
        try:
            parsed_date = datetime.strptime(row[3], '%Y-%m-%d %H:%M:%S')
            temp_order_data.append(row + [parsed_date])
        except ValueError as e:
            print('error')

    temp_order_data.sort(key=lambda x: x[-1], reverse=True)
    for row in temp_order_data:
        if row[4] == userId:

            prod_row = getProductRow(getSheetData(), row[1])
            ship_status = prod_row[3]

            curr_order = {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {"type": "text", "text": "訂購明細:", "weight": "bold", "size": "xl"},
                        {"type": "text", "text": f"姓名： {row[5]}", "margin": "md"},
                        {"type": "text", "text": f"商品名稱: {row[1]}", "margin": "md"},
                        {"type": "text", "text": f"訂單編號: {row[0]}", "margin": "md"},
                        {"type": "text", "text": f"購買時間: {row[3]}", "margin": "md"},
                        {"type": "text", "text": f"購買數量：{row[8]}", "margin": "md"},
                        {"type": "text", "text": f"總計金額: {row[9]}", "margin": "md"},
                        {"type": "text", "text": f"商品狀態: {ship_status}", "margin": "md"}
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