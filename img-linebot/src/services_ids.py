from src.api_service import Create_Service
from linebot import (LineBotApi, WebhookHandler)
from linebot.models import *

# ------------------------------------Line API------------------------------------

LINE_BOT_API = LineBotApi('AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU=')
WEBHOOK_HANDLER = WebhookHandler('1cbd45d2293324e4bfc8422ba66fd8ae')
CHANNEL_ACCESS_TOKEN = 'AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU='

# ------------------------------------Google API------------------------------------

CLIENT_SECRET_FILE = 'Service_Secret.json'
SS_SERVICE = Create_Service(CLIENT_SECRET_FILE, 'sheets', 'v4', ['https://www.googleapis.com/auth/spreadsheets'])
DRIVE_SERVICE = Create_Service(CLIENT_SECRET_FILE, 'drive', 'v3', ['https://www.googleapis.com/auth/drive'])

# ------------------------------------File ID------------------------------------

MASTER_SHEET_ID = '1bhrV63b9Tfm5WukXR2EyQdBlN_rUUY8EHArnQlfmu2Y'

TEMPLATE_PRODUCT_SHEET_ID = '1AIR-q-4kPcqVfM45pMYcmuOd0sGgoox-aT3dhzI8Bf8'
TARGET_PRODUCT_SHEET_FOLDER_ID = "13SUG0WZIss7kfC5JJdrJu1cV7QT71G04"

# ------------------------------------Sheet Name------------------------------------

MASTER_PRODUCT_INFO_SHEET_NAME = "團購資訊"
MASTER_USER_STATES_SHEET_NAME = "用戶資訊"
MASTER_ORDER_SHEET_NAME = "所有訂單"

PRODUCT_ORDER_SHEET_NAME = "所有訂單"
PRODUCT_DATA_ANALYSIS_SHEET_NAME = "數據分析"
PRODUCT_EXPOSURE_SHEET_NAME = "曝光用戶"

# ------------------------------------Column Name------------------------------------

MASTER_PROD_ID_COL_NAME = "商品ID"
MASTER_PROD_NAME_COL_NAME = "商品"
MASTER_AVAILABIITY_STATE_COL_NAME = "開團狀態"
MASTER_PROD_STATE_COL_NAME = "商品狀態"
MASTER_PROD_COST_COL_NAME = "成本"
MASTER_PROD_PRICE_COL_NAME = "售價"
MASTER_PROD_MIN_ORDER_COL_NAME = "最少訂購數"
MASTER_PROD_MAX_ORDER_COL_NAME = "訂購數上限"
MASTER_PROD_MIN_ORDER_PER_PERSON_COL_NAME = "單人最少訂購數"
MASTER_PROD_MAX_ORDER_PER_PERSON_COL_NAME = "單人最多訂購數"
MASTER_PROD_DISCRIPTION_COL_NAME = "商品敘述"
MASTER_PROD_PIC_COL_NAME = "照片"
MASTER_PROD_SHEET_ID_COL_NAME = "商品試算表ID"
MASTER_PROD_SHEET_LINK_COL_NAME = "商品試算表連結"

ORDER_ORDER_NUM_COL_NAME = "訂單編號"
ORDER_TIMESTAMP_COL_NAME = "時間戳記"
ORDER_USER_ID_COL_NAME = "用戶ID"
ORDER_USER_NAME_COL_NAME = "姓名"
ORDER_USER_PHONE_COL_NAME = "電話"
ORDER_USER_EMAIL_COL_NAME = "電子郵件信箱"
ORDER_QUANTITY_COL_NAME = "數量"
ORDER_TOTAL_PRICE_COL_NAME = "總計金額"

# ------------------------------------State Name------------------------------------

AVAILABILITY_AVAILABLE_STATE = "開團"

# ------------------------------------General Functions------------------------------------

def reply_msg(event, msg):
    if type(msg) is str:
        LINE_BOT_API.reply_message(event.reply_token, TextSendMessage(msg))
    else:
        LINE_BOT_API.reply_message(event.reply_token, msg)