import requests
from datetime import datetime
import pytz
import random

cus_url = "http://localhost/db/customers"
sup_url = "http://localhost/db/suppliers"
prod_url = "http://localhost/db/products"
grp_url = "http://localhost/db/groups"
ordr_url = "http://localhost/db/orders"
viw_url = "http://localhost/db/views"
analysis_curl = "http://localhost/db/analysis"

def print_response(response):
    # print(response.status_code)
    print(f"{response.status_code}: {response.json()}")

def add_test_data():
    customers = [
        {"id": "C0001", "name": "vince", "phone": "0999999999", "email":"a@gmail.com"},
        {"id": "C0002", "name": "hans", "phone": "0999999999", "email":"b@gmail.com"},
        {"id": "C0003", "name": "wang", "phone": "0999999999", "email":"c@gmail.com"}
    ]
    for customer in customers:
        print_response(requests.post(cus_url, json=customer))


    products = [
        { "name": "prod1", "cost":50, "supplier_id": "S0001"},
        { "name": "prod2", "cost":50, "supplier_id": "S0002"},
        { "name": "prod3", "cost":50, "supplier_id": "S0003"}
    ]
    for product in products:
        print_response(requests.post(prod_url, json=product))

    groups = [
        {"product_id" : "P0001","selling_price" : 2,"status" : "waiting","start_time" : 1},
        {"product_id" : "P0002","selling_price" : 2,"status" : "waiting","start_time" : 1},
        {"product_id" : "P0003","selling_price" : 2,"status" : "waiting","start_time" : 1}
    ]
    for group in groups:
        print_response(requests.post(grp_url, json=group))

    orders = [
        {"timestamp" : 1,"customer_id" : "C0001","group_id" : "G0001","qty" : 1, "status": "waiting"},
        {"timestamp" : 1,"customer_id" : "C0002","group_id" : "G0002","qty" : 1, "status": "waiting"},
        {"timestamp" : 1,"customer_id" : "C0003","group_id" : "G0003","qty" : 1, "status": "waiting"},
    ]
    for order in orders:
        print_response(requests.post(ordr_url, json=order))

    views = [
        {"timestamp" : 1,"customer_id" : "C0001","group_id" : "G0001","view_type" : "view"},
        {"timestamp" : 1,"customer_id" : "C0002","group_id" : "G0002","view_type" : "view"},
        {"timestamp" : 1,"customer_id" : "C0003","group_id" : "G0003","view_type" : "click"},
    ]
    for view in views:
        print_response(requests.post(viw_url, json=view))

def get_cur_time():
    taiwan_tz = pytz.timezone('Asia/Taipei')
    current_datetime = datetime.now(taiwan_tz)
    cur_time_pure_number = current_datetime.strftime("%Y%m%d%H%M%S")
    return cur_time_pure_number

def pure_number_to_formatted(pure_number):
    dt = datetime.strptime(pure_number, "%Y%m%d%H%M%S")
    return dt.strftime("%Y-%m-%d %H:%M:%S")



if __name__ == '__main__':
    # print(pure_number_to_formatted(get_cur_time()))
    # order_info = {"customer_id": "U6286e9520fad3a1232e6937d6393f8c8:", "group_id": "G0001", "qty": 5}
    # print_response(requests.post(ordr_url, json=order_info))

    # print_response(requests.post(prod_url, json={ "name": "prod1", "cost":50, "supplier_id": "S0001"}))
    # for i in range(10100):
    #     print_response(requests.post(sup_url, json={"name": "s1", "contact_person": "vincent (yin-hsuan chen)", "phone": "0999999999", "email":"a@gmail.com"}))

    # print_response(requests.post(sup_url, json={"name": "s1", "contact_person": "vincent (yin-hsuan chen)", "phone": "0999999999", "email":"a@gmail.com"}))
    # for i in range(4, 104):
    #     requests.delete(sup_url + f"/S{i:04}")


    # print_response(requests.post(grp_url, json={"product_id" : "P0001","selling_price" : 2,"status" : "waiting","start_time" : 1}))
    
    # print_response(requests.post(prod_url, json={ "name": "prod1", "cost":50, "supplier_id": "S0001"}))

    # print_response(requests.get(prod_url))

    # print_response(requests.get("http://localhost/db/last_updated"))
    print(requests.get("http://localhost/db/analysis/item/totalviews").json())
    print(requests.get("http://localhost/db/analysis/item/ordercounts").json())