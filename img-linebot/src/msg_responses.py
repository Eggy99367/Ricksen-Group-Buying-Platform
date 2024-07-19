from src.sheet import *
from src.services_ids import *
from src.line_messages import *
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

def groupBuyingInfo(event): #團購資訊
    print("here's ok")
    user_id = event.source.user_id
    update_user_states(user_id, state="get_prods_info")

    response = requests.get(f'{API_URL}/db/groups/available')
    groups = response.json()
    if len(groups) == 0:
        reply_msg(event, f"抱歉，目前沒有正在進行的開團項目！")
        return

    prod_carousel = []
    for group in groups:
        exist = requests.get(f"{API_URL}/db/views/check_viewer_exist/{user_id}/{group['id']}").json()
        if not exist["exists"]:
            requests.post(f"{API_URL}/db/views", json={"customer_id": user_id, "group_id": group["id"], "view_type": "view"})

        prod = requests.get(f"{API_URL}/db/products/{group['product_id']}").json()
        current_prod = CarouselColumn(
            thumbnail_image_url = prod["img"],
            title = prod["name"], 
            text = f"{prod["description"]}\n"
                    + f"售價:{group["selling_price"]}",
            actions = [
                MessageAction(
                    label = "立刻下單",
                    text = f"我要下單 [{prod["name"]}]!"
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

def prodSelectConfirm(event): # 我要下單 [product name]!
    user_id = event.source.user_id


    match = re.search(r"\[(.*?)\]", event.message.text)
    if match:
        try:
            group_id = match.group(1)
            group = requests.get(f'{API_URL}/db/groups/{group_id}').json()
            prod = requests.get(f"{API_URL}/db/products/{group['product_id']}").json()
            update_user_states(user_id, state="prod_select_confirm", grp=group['id'])

            exist = requests.get(f"{API_URL}/db/views/check_clicker_exist/{user_id}/{group['id']}").json()
            if not exist["exists"]:
                requests.post(f"{API_URL}/db/views", json={"customer_id": user_id, "group_id": group["id"], "view_type": "click"})

        except Exception as e:
            reply_msg(event, f"抱歉，商品[{prod["name"]}]不存在或不開放下單！")
            return

        msg = TemplateSendMessage(
            alt_text="商品確認",
            template=ButtonsTemplate(
                thumbnail_image_url=prod['img'],
                title = prod['name'], 
                text = f"售價:{group["selling_price"]}\n這是您想下單的產品嗎?",
                actions = [
                    MessageAction(
                        label = '是',
                        text = f"是的，我想購買此商品!"
                    ),
                    MessageAction(
                        label = '不是',
                        text = f"取消訂單"
                    )
                ]
            )
        )
        reply_msg(event, msg)
    else:
        reply_msg(event, "抱歉，商品不存在！")
        return

def orderRequestConfirmed(event): # 是的，我想購買此商品!
    user_id = event.source.user_id
    update_user_states(user_id, state="order_request_confirmed")
    user_states = get_user_states(user_id)

    if not user_states["name"] or not user_states["email"] or not user_states["phone"]:
        askName(event)
    else:
        userdataExist(event)

def handleSpecialRequest(event):
    user_id = event.source.user_id
    state = get_user_states(user_id)["state"]["state"]
    print("state:", state)
    if state == "ask_name":
        updateName(event)
    elif state == "ask_email":
        updateEmail(event)
    elif state == "ask_phone":
        updatePhone(event)
    elif state == "ask_quantity":
        updateQuantity(event)
