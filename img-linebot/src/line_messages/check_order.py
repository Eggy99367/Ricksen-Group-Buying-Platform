from src.sheet import *
from src.services_ids import *
import src.global_vars
from linebot.models import *

def checkOrder(event):
    orderData = get_range(MASTER_SHEET_ID, MASTER_ORDER_SHEET_NAME, (0, 0), (9000000, 9))
    userId = event.source.user_id
    orders = []

    for row in orderData:
        if row[4] == userId:

            prod_row = getProductRow(getSheetData(), row[1])
            ship_status = prod_row[src.global_vars.master_cols[MASTER_PROD_STATE_COL_NAME]]

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