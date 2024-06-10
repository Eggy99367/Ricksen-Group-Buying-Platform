from flask import Flask, request, abort, jsonify

from linebot.exceptions import (InvalidSignatureError)
from linebot.models import *

import src.msg_responses as msg_responses
from src.services_ids import *
from src.sheet import get_user_states
import src.global_vars
import requests

app = Flask(__name__)

CMD_DICT = {
    "團購資訊": msg_responses.groupBuyingInfo,
    "我要下單": msg_responses.prodSelectConfirm,
    "是的，我想購買此商品!": msg_responses.orderRequestConfirmed,
    "是，繼續購物": msg_responses.askQuantity,
    "否，重新輸入用戶資訊": msg_responses.askName,
    "確認資訊無誤，確認訂單": msg_responses.orderConfirmed,
    "取消訂單": msg_responses.orderCanceled,
    "查看訂單": msg_responses.checkOrder
}

# @app.route('/linebot/', methods=['POST'])
# def handle_post_request():
#     data = request.json
#     if data is None:
#         return jsonify({'error': 'No JSON data received'}), 400
#     response_data = {'received_data': data}
#     return jsonify(response_data)

# 監聽所有來自 /callback 的 Post Request
@app.route("/linebot/callback", methods=['POST'])
def callback():
    print("get callback")
    signature = request.headers['X-Line-Signature']
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)
    try:
        WEBHOOK_HANDLER.handle(body, signature)
    except InvalidSignatureError:
        abort(400)
    return 'OK'

@WEBHOOK_HANDLER.add(MessageEvent, message=TextMessage)
def handle_message(event):
    message = event.message.text
    user_id = event.source.user_id

    # print(event)
    print(f"{user_id}: {message}")
    if requests.get(f'http://crm-api/db/customers/{user_id}').status_code == 400:
        requests.post('http://crm-api/db/customers', json={"id":user_id})
        print("add new user")
    else:
        print("user exist")

    user_state = get_user_states(user_id)
    
    cmd = message.split()[0]
    if cmd in CMD_DICT:
        CMD_DICT[cmd](event)
    elif "state" in user_state and user_state["state"] != "message":
        msg_responses.handleSpecialRequest(event)
    else:
        msg_responses.reply_msg(event, message)

#主程式
import os
if __name__ == "__main__":
    # app.run(host='0.0.0.0', port="8081:80")
    app.run()