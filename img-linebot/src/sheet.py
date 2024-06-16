from src.services_ids import *
import src.global_vars
from datetime import datetime
import json
import pytz
import requests

def get_user_states(user_id):
    user_state = requests.get(f'{API_URL}/db/customers/{user_id}').json()
    user_state["state"] = json.loads(user_state["state"])
    return user_state

def update_user_states(user_id, **kw_args):
    user = requests.get(f'{API_URL}/db/customers/{user_id}').json()
    state = json.loads(user["state"])
    for k, v in kw_args.items():
        if k in ["name", "phone", "email"]:
            user[k] = v
        else:
            state[k] = v
    user["state"] = json.dumps(state)
    post_response = requests.put(f'{API_URL}/db/customers/{user_id}', json={"state": user["state"]})
    print("Here's user status update status code:")
    print(post_response.status_code)

def update_user_info(user_id, **kw_args):
    for k, v in kw_args.items():
        requests.put(f'{API_URL}/db/customers/{user_id}', json={k: v})
    

