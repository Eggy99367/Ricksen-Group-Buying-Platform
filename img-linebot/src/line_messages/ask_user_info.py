from src.sheet import *
from src.services_ids import *
from src.line_messages.input_validation import *
from src.line_messages.new_order import askQuantity
from linebot.models import *

def userdataExist(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="userdata_exist")

    user_state = get_user_states(user_id)
    msg = TemplateSendMessage(
        alt_text="用戶資料確認",
        template=ButtonsTemplate(
            text = f"用戶資料已存在，是否要使用以下資料繼續購物？\n\n"
                    + f"-姓名: {user_state['name']}\n"
                    + f"-電子郵件信箱: {user_state['email']}\n"
                    + f"-電話號碼: {user_state['phone']}",
            actions = [
                MessageAction(
                    label = "是，繼續購物",
                    text = "是，繼續購物"
                ),
                MessageAction(
                    label = "否，重新輸入用戶資訊",
                    text = "否，重新輸入用戶資訊"
                )
            ]
        )
    )
    # print(event.source.userId)
    reply_msg(event, msg)

def askName(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="ask_name")
    reply_msg(event, f"請問您的姓名是？")

def updateName(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="get_name")
    update_user_info(user_id, name=event.message.text)
    askEmail(event)

def askEmail(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="ask_email")
    reply_msg(event, f"請問您的電子郵件信箱是？\n(範例格式:sample@gmail.com)")

def updateEmail(event):
    user_id = event.source.user_id
    if isEmail(event.message.text):
        update_user_states(user_id, state="get_email")
        update_user_info(user_id, email=event.message.text)
        askPhone(event)
    else:
        reply_msg(event, f"錯誤Email格式，請重新輸入!\n請問您的電子郵件信箱是？\n(範例格式:sample@gmail.com)")


def askPhone(event):
    user_id = event.source.user_id
    update_user_states(user_id, state="ask_phone")
    reply_msg(event, f"請問您的手機電話是？\n(範例格式:09XXXXXXXX)")

def updatePhone(event):
    user_id = event.source.user_id
    if isPhoneNum(event.message.text):
        update_user_states(user_id, state="get_phone")
        update_user_info(user_id, phone=event.message.text)
        askQuantity(event)
    else:
        reply_msg(event, f"錯誤手機號碼格式，請重新輸入!\n請問您的手機電話是？\n(範例格式:09XXXXXXXX)")
