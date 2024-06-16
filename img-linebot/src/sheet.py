from src.services_ids import *
import src.global_vars
from datetime import datetime
import json
import pytz
import requests

# ---------------------------------------------------------------------------

def copy_file(file_id, folder_id, new_file_name):
    body = {
        'name': new_file_name,
        'parents': [folder_id] if folder_id else None
    }
    response = DRIVE_SERVICE.files().copy(fileId=file_id, body=body).execute()
    print('Copied file ID:', response.get('id'))
    return response.get('id')

def createNewProductSheet(product_name, product_id, product_price):
    new_file_name = f"[{product_name}]訂單"
    new_ssId = copy_file(TEMPLATE_PRODUCT_SHEET_ID, TARGET_PRODUCT_SHEET_FOLDER_ID, new_file_name)
    taiwan_tz = pytz.timezone('Asia/Taipei')
    cur_time = datetime.now(taiwan_tz).strftime("%Y-%m-%d %H:%M:%S")
    edit_range(new_ssId, "訂單概況", (0, 1), (3, 1), [[product_name], [product_id], [cur_time], [product_price]])
    return new_ssId

def update_permission(file_id, user_email, role):
    user_permission = {
        'type': 'user',
        'role': role,
        'emailAddress': user_email,
        'sendNotificationEmail': False
    }
    try:
        DRIVE_SERVICE.permissions().create(
            fileId=file_id,
            body=user_permission,
            fields='id',
        ).execute()
        print('Permission Updated:', file_id)
    except Exception as e:
        print('Failed to add permissions:', e)

# ---------------------------------------------------------------------------

def get_cell(sheet_id, ss_name, index):
    range_name = f'{ss_name}!{chr(65 + index[1])}{index[0] + 1}'

    get_value = SS_SERVICE.spreadsheets().values().get(
        spreadsheetId = sheet_id,
        majorDimension = 'ROWS',
        range = range_name
    ).execute()['values'][0][0]

    return get_value

def get_range(sheet_id, ss_name, start_index, end_index):
    range_name = f'{ss_name}!{chr(65 + start_index[1])}{start_index[0] + 1}:{chr(65 + end_index[1])}{end_index[0] + 1}'

    get_values = SS_SERVICE.spreadsheets().values().get(
        spreadsheetId = sheet_id,
        majorDimension = 'ROWS',
        range = range_name
    ).execute()['values']

    return get_values

def edit_cell(sheet_id, ss_name, index, new_value):
    range_name = f'{ss_name}!{chr(65 + index[1])}{index[0] + 1}'
    request_body = {
        'values': [[new_value]]
    }
    response = SS_SERVICE.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=range_name,
        valueInputOption='RAW',
        body=request_body
    ).execute()

def edit_range(sheet_id, ss_name, start_index, end_index, new_values):
    range_name = f'{ss_name}!{chr(65 + start_index[1])}{start_index[0] + 1}:{chr(65 + end_index[1])}{end_index[0] + 1}'
    request_body = {
        'values': new_values
    }
    response = SS_SERVICE.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=range_name,
        valueInputOption='RAW',
        body=request_body
    ).execute()

# ---------------------------------------------------------------------------

def updateColNums(col_names: list[str]):
    cols = {}
    for index, name in enumerate(col_names):
        cols[name] = index
    return cols

def productsSheetExist(ssData):
    update = False
    for index, row in enumerate(ssData):
        if(len(row) <= src.global_vars.master_cols[MASTER_PROD_SHEET_ID_COL_NAME] or row[src.global_vars.master_cols[MASTER_PROD_SHEET_ID_COL_NAME]] == ""):
            update = True
            ssid = createNewProductSheet(row[src.global_vars.master_cols[MASTER_PROD_NAME_COL_NAME]], row[src.global_vars.master_cols[MASTER_PROD_ID_COL_NAME]], row[src.global_vars.master_cols[MASTER_PROD_PRICE_COL_NAME]])
            sheet_url = "https://docs.google.com/spreadsheets/d/" + ssid
            edit_range(MASTER_SHEET_ID, MASTER_PRODUCT_INFO_SHEET_NAME, (index + 1, src.global_vars.master_cols[MASTER_PROD_SHEET_ID_COL_NAME]), (index + 1, src.global_vars.master_cols[MASTER_PROD_SHEET_LINK_COL_NAME]), [[ssid, sheet_url]])
    if update:
        ssData = getSheetData()
    return ssData

def getSheetData():
    ssData = get_range(MASTER_SHEET_ID, MASTER_PRODUCT_INFO_SHEET_NAME, (0, 0), (1000, 13))
    src.global_vars.master_cols = updateColNums(ssData[0])
    return productsSheetExist(ssData[1:])

# def get_user_states():
#     user_states_text = get_cell(MASTER_SHEET_ID, MASTER_USER_STATES_SHEET_NAME, (0, 0))
#     return json.loads(user_states_text)

# def update_user_states():
#     user_states_text = json.dumps(src.global_vars.user_states)
#     edit_cell(MASTER_SHEET_ID, MASTER_USER_STATES_SHEET_NAME, (0, 0), user_states_text)

def get_user_states(user_id):
    user_state = requests.get(f'http://3.27.144.225:8080/db/customers/{user_id}').json()
    user_state["state"] = json.loads(user_state["state"])
    return user_state

def update_user_states(user_id, **kw_args):
    user = requests.get(f'http://3.27.144.225:8080/db/customers/{user_id}').json()
    state = json.loads(user["state"])
    for k, v in kw_args.items():
        if k in ["name", "phone", "email"]:
            user[k] = v
        else:
            state[k] = v
    user["state"] = json.dumps(state)
    post_response = requests.put(f'http://3.27.144.225:8080/db/customers/{user_id}', json={"state": user["state"]})
    print("Here's user status update status code:")
    print(post_response.status_code)

def update_user_info(user_id, **kw_args):
    for k, v in kw_args.items():
        requests.put(f'http://3.27.144.225:8080/db/customers/{user_id}', json={k: v})
    


def productExist(ssData, prod_name):
    for row in ssData:
        if row[src.global_vars.master_cols[MASTER_PROD_NAME_COL_NAME]] == prod_name:
            return True
    return False

def productAvailable(ssData, prod_name):
    for row in ssData:
        if (row[src.global_vars.master_cols[MASTER_PROD_NAME_COL_NAME]] == prod_name
            and row[src.global_vars.master_cols[MASTER_AVAILABIITY_STATE_COL_NAME]] == AVAILABILITY_AVAILABLE_STATE):
            return True
    return False

def getProductRow(ssData, prod_name):
    for row in ssData:
        if row[src.global_vars.master_cols[MASTER_PROD_NAME_COL_NAME]] == prod_name:
            return row

