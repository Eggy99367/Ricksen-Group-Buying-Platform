from src.sheet import *
from src.services_ids import *
from src.line_messages import *
import src.global_vars
from linebot import (LineBotApi, WebhookHandler)
from linebot.exceptions import (InvalidSignatureError)
from linebot.models import *
import requests
from datetime import datetime, timedelta
import re
import pytz

tz_utc_9 = pytz.timezone('Asia/Tokyo')

def getFollower(date):
    headers = {
        'Authorization': f'Bearer {CHANNEL_ACCESS_TOKEN}'
    }
    url = f'https://api.line.me/v2/bot/insight/followers?date={date}'
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'ready':
            return data['followers']  
        else:
            return "Data calculation is still in progress, try again later."
    else:
        return f"Failed to retrieve data: {response.status_code} - {response.text}"
    
def checkUserIdExist(sheet_id, user_id):
    ids = get_range(sheet_id, PRODUCT_EXPOSURE_SHEET_NAME, (0, 0), (9000000, 0))
    for id in ids:
        if id[0] == user_id:
            return True
    return False
    

def groupBuyingInfo(event): #團購資訊
    print("here's ok")
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "get_prods_info"
    update_user_states()

    ssData = getSheetData()
    prod_carousel = []
    for prod_row in ssData:

        if(prod_row[src.global_vars.master_cols[MASTER_AVAILABIITY_STATE_COL_NAME]] != AVAILABILITY_AVAILABLE_STATE):
            continue

        productSheetId = prod_row[src.global_vars.master_cols[MASTER_PROD_SHEET_ID_COL_NAME]]
        currFollower = getFollower((datetime.now(tz_utc_9) - timedelta(days=1)).strftime('%Y%m%d'))
        edit_cell(productSheetId, PRODUCT_DATA_ANALYSIS_SHEET_NAME, (0, 1), currFollower)

        row_num = len(get_range(productSheetId, PRODUCT_EXPOSURE_SHEET_NAME, (0, 0), (9000000, 0)))
        src.global_vars.user_states[user_id]["state"] = checkUserIdExist(productSheetId, user_id)
        update_user_states()
        if not checkUserIdExist(productSheetId, user_id):
            edit_cell(productSheetId, PRODUCT_EXPOSURE_SHEET_NAME, (row_num, 0), user_id)

        prod_name = prod_row[src.global_vars.master_cols[MASTER_PROD_NAME_COL_NAME]]
        prod_text = prod_row[src.global_vars.master_cols[MASTER_PROD_DISCRIPTION_COL_NAME]]
        prod_price = prod_row[src.global_vars.master_cols[MASTER_PROD_PRICE_COL_NAME]]
        prod_image_url = prod_row[src.global_vars.master_cols[MASTER_PROD_PIC_COL_NAME]]

        current_prod = CarouselColumn(
            thumbnail_image_url = prod_image_url,
            title = prod_name, 
            text = f"{prod_text}\n"
                    + f"售價:{prod_price}",
            actions = [
                MessageAction(
                    label = "立刻下單",
                    text = f"我要下單 [{prod_name}]!"
                )
            ]
        )
        prod_carousel.append(current_prod)
    carousel_template_message = TemplateSendMessage(
        alt_text = '分享了團購資訊',
        template = CarouselTemplate(
            columns = prod_carousel
        )
    )
    reply_msg(event, carousel_template_message)

def prodSelectConfirm(event): # 我要下單 [商品名稱]!
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "prod_select_confirm"
    update_user_states()


    match = re.search(r"\[(.*?)\]", event.message.text)
    if match:
        product_name = match.group(1)
        ssData = getSheetData()
        if not productExist(ssData, product_name):
            reply_msg(event, f"抱歉，商品[{product_name}]不存在！")
            return
        elif not productAvailable(ssData, product_name):
            reply_msg(event, f"抱歉，商品[{product_name}]目前並不開放下單！")
            return
        product_info = getProductRow(ssData, product_name)

        src.global_vars.user_states[user_id]["prod"] = product_name
        update_user_states()

        msg = TemplateSendMessage(
            alt_text="商品確認",
            template=ButtonsTemplate(
                thumbnail_image_url=product_info[src.global_vars.master_cols[MASTER_PROD_PIC_COL_NAME]],
                title = product_name, 
                text = f"售價:{product_info[src.global_vars.master_cols[MASTER_PROD_PRICE_COL_NAME]]}\n這是您想下單的產品嗎?",
                actions = [
                    MessageAction(
                        label = '是',
                        text = f"是的，我想購買 [{product_name}]!"
                    ),
                    MessageAction(
                        label = '不是',
                        text = f"取消訂單"
                    )
                ]
            )
        )
        # print(event.source.userId)
        reply_msg(event, msg)
    else:
        reply_msg(event, "抱歉，商品不存在！")
        return

def orderRequestConfirmed(event): # 是的，我想購買 [商品名稱]!
    user_id = event.source.user_id
    src.global_vars.user_states[user_id]["state"] = "order_request_confirmed"
    update_user_states()

    user_states = src.global_vars.user_states[user_id]

    if not user_states["name"] or not user_states["email"] or not user_states["phone"]:
        askName(event)
    else:
        userdataExist(event)

def handleSpecialRequest(event):
    user_id = event.source.user_id
    state = src.global_vars.user_states[user_id]["state"]
    if state == "ask_name":
        updateName(event)
    elif state == "ask_email":
        updateEmail(event)
    elif state == "ask_phone":
        updatePhone(event)
    elif state == "ask_quantity":
        updateQuantity(event)