from linebot import (LineBotApi, WebhookHandler)
from linebot.models import *

# ------------------------------------Line API------------------------------------

LINE_BOT_API = LineBotApi('AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU=')
WEBHOOK_HANDLER = WebhookHandler('1cbd45d2293324e4bfc8422ba66fd8ae')
CHANNEL_ACCESS_TOKEN = 'AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU='

# ------------------------------------API Link------------------------------------

API_URL = "https://71ad-45-144-227-17.ngrok-free.app"

# ------------------------------------General Functions------------------------------------

def reply_msg(event, msg):
    if type(msg) is str:
        LINE_BOT_API.reply_message(event.reply_token, TextSendMessage(msg))
    else:
        LINE_BOT_API.reply_message(event.reply_token, msg)