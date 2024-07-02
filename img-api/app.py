from flask import Flask, request, jsonify
from src.models import db, Customer, Supplier, Product, Group_Record, Order_Record, LastUpdated, User
from src import customer, supplier, product, group, order, view
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from sqlalchemy import event
from src.basics import *
import requests

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@crm-db/saas'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'sofdktivmwliynsiovcmtyislgo'

db.init_app(app)

jwt = JWTManager(app)

# ----------------------------------------------------------------------------------------

def update_last_updated(table_name, connection):
    try:
        stmt = LastUpdated.__table__.insert().values(
            table_name=table_name,
            time=str(get_cur_time())
        )
        connection.execute(stmt)
    except:
        stmt = LastUpdated.__table__.update().where(
            LastUpdated.table_name == table_name
        ).values(
            time=get_cur_time()
        )
        connection.execute(stmt)

tables = [Customer, Supplier, Product, Group_Record, Order_Record, User]
for table in tables:
    table_name = table.__tablename__

    def create_after_insert_listener(table_name):
        def after_insert(mapper, connection, target):
            update_last_updated(table_name, connection)
            print(f"{table_name} {target.id} has been inserted.")
        return after_insert

    def create_after_update_listener(table_name):
        def after_update(mapper, connection, target):
            update_last_updated(table_name, connection)
            print(f"{table_name} {target.id} has been updated.")
        return after_update

    def create_after_delete_listener(table_name):
        def after_delete(mapper, connection, target):
            update_last_updated(table_name, connection)
            print(f"{table_name} {target.id} has been deleted.")
        return after_delete

    event.listen(table, 'after_insert', create_after_insert_listener(table_name))
    event.listen(table, 'after_update', create_after_update_listener(table_name))
    event.listen(table, 'after_delete', create_after_delete_listener(table_name))

@app.route('/db/last_updated', methods=['GET'])
def get_last_updateds():
    try:
        last_updateds = LastUpdated.query.all()
        return jsonify([last_updated.get_info() for last_updated in last_updateds])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/db/last_updated/<string:table_name>', methods=['GET'])
def get_last_updated(table_name):
    try:
        last_updated = LastUpdated.query.get_or_404(table_name)
        return jsonify(last_updated.get_info())
    except Exception as e:
        return jsonify({
            "table_name": table_name,
            "time": "0"
        })

# ----------------------------------------------------------------------------------------

@app.route('/db/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    print("register:", email)
    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/db/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)
    print("login:", email)
    return jsonify(access_token=access_token), 200

@app.route('/db/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(logged_in_as=user.email), 200

@app.route('/db/users', methods=['GET'])
def get_users():
    try:
        customers = User.query.all()
        # print(customers)
        return jsonify([customer.get_info() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ----------------------------------------------------------------------------------------

@app.route('/db/customers', methods=['GET'])
def get_customers():
    return customer.get_customers()

@app.route('/db/customers/<string:id>', methods=['GET'])
def get_customer(id):
    return customer.get_customer(id)

@app.route('/db/customers', methods=['POST'])
def add_customer():
    return customer.add_customer()

@app.route('/db/customers/<string:id>', methods=['PUT'])
def update_customer(id):
    return customer.update_customer(id)

@app.route('/db/customers/<string:id>', methods=['DELETE'])
def delete_customer(id):
    return customer.delete_customer(id)

# ----------------------------------------------------------------------------------------

@app.route('/db/suppliers', methods=['GET'])
def get_suppliers():
    return supplier.get_suppliers()

@app.route('/db/suppliers/<string:id>', methods=['GET'])
def get_supplier(id):
    return supplier.get_supplier(id)

@app.route('/db/suppliers/names', methods=['GET'])
def get_supplier_names():
    return supplier.get_supplier_names()

@app.route('/db/suppliers', methods=['POST'])
def add_supplier():
    return supplier.add_supplier()

@app.route('/db/suppliers/<string:id>', methods=['PUT'])
def update_supplier(id):
    return supplier.update_supplier(id)

@app.route('/db/suppliers/<string:id>', methods=['DELETE'])
def delete_supplier(id):
    return supplier.delete_supplier(id)

# ----------------------------------------------------------------------------------------

@app.route('/db/products', methods=['GET'])
def get_products():
    return product.get_products()

@app.route('/db/products/<string:id>', methods=['GET'])
def get_product(id):
    return product.get_product(id)

@app.route('/db/products/names', methods=['GET'])
def get_product_names():
    return product.get_product_names()

@app.route('/db/products', methods=['POST'])
def add_product():
    return product.add_product()

@app.route('/db/products/<string:id>', methods=['PUT'])
def update_product(id):
    return product.update_product(id)

@app.route('/db/products/<string:id>', methods=['DELETE'])
def delete_product(id):
    return product.delete_product(id)

# ----------------------------------------------------------------------------------------

@app.route('/db/groups', methods=['GET'])
def get_groups():
    return group.get_groups()

@app.route('/db/groups/<string:id>', methods=['GET'])
def get_group(id):
    return group.get_group(id)

@app.route('/db/groups/available', methods=['GET'])
def get_available_groups():
    return group.get_available_groups()

@app.route('/db/groups', methods=['POST'])
def add_group():
    return group.add_group()

@app.route('/db/groups/<string:id>', methods=['PUT'])
def update_group(id):
    return group.update_group(id)

@app.route('/db/groups/<string:id>', methods=['DELETE'])
def delete_group(id):
    return group.delete_group(id)

# ----------------------------------------------------------------------------------------

@app.route('/db/orders', methods=['GET'])
def get_orders():
    return order.get_orders()

@app.route('/db/orders/<string:id>', methods=['GET'])
def get_order(id):
    return order.get_order(id)

@app.route('/db/orders/by_pgrp/<string:grp_id>', methods=['GET'])
def get_order_by_group(grp_id):
    return order.get_order_by_group(grp_id)

@app.route('/db/orders/by_custid/<string:cust_id>', methods=['GET'])
def get_order_by_customer(cust_id):
    return order.get_order_by_customer(cust_id)

@app.route('/db/orders/<string:grp_id>/total', methods=['GET'])
def get_group_total_qty(grp_id):
    return order.get_group_total_qty(grp_id)

@app.route('/db/orders/<string:grp_id>/total/<string:cust_id>', methods=['GET'])
def get_group_total_customer_qty(grp_id, cust_id):
    return order.get_group_total_customer_qty(grp_id, cust_id)

@app.route('/db/orders', methods=['POST'])
def add_order():
    return order.add_order()

@app.route('/db/orders/<string:id>', methods=['PUT'])
def update_order(id):
    return order.update_order(id)

@app.route('/db/orders/<string:id>', methods=['DELETE'])
def delete_order(id):
    return order.delete_order(id)

# ----------------------------------------------------------------------------------------

@app.route('/db/views', methods=['GET'])
def get_views():
    return view.get_views()

@app.route('/db/views/views', methods=['GET'])
def get_all_views():
    return view.get_all_views()

@app.route('/db/views/clicks', methods=['GET'])
def get_all_clicks():
    return view.get_all_clicks()

@app.route('/db/views', methods=['POST'])
def add_view():
    return view.add_view()

@app.route('/db/views/by_pgrp/<string:grp_id>', methods=['GET'])
def get_views_by_group(grp_id):
    return view.get_views_by_group(grp_id)

@app.route('/db/views/check_viewer_exist/<string:cust_id>/<string:grp_id>', methods=['GET'])
def check_viewer_exist(cust_id, grp_id):
    return view.check_viewer_exist(cust_id, grp_id)

@app.route('/db/views/check_clicker_exist/<string:cust_id>/<string:grp_id>', methods=['GET'])
def check_clicker_exist(cust_id, grp_id):
    return view.check_clicker_exist(cust_id, grp_id)

# ----------------------------------------------------------------------------------------

@app.route('/followers/<string:date>', methods=['GET'])
def check_followers(date):
    headers = {
        'Authorization': f'Bearer {'AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU='}'
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

# @app.route('/db/...', methods=['GET'])
# def get_view_rate():
#     total_views = view.get_all_views()
#     total_customers = None

#     try:
#         rate = total_views / total_customers
#         return jsonify({"view rate": rate}), 200
#     except ZeroDivisionError:
#         return jsonify({"error": "cannot make division by zero"}), 400

# @app.route('/db/...', methods=['GET'])
# def get_click_rate():
#     total_views = view.get_all_views()
#     total_clicks = view.get_all_clicks()

#     try: 
#         rate = total_clicks / total_views
#         return jsonify({"clcik rate": rate}), 200
#     except ZeroDivisionError:
#         return jsonify({"error": "cannot make division by zero"}), 400



# @app.route('/db/analysis/customers', methods=['GET'])
# def get_total_customers():
#     totalcustomers = customer.get_customers_count()

#     try:
#         return jsonify({'Number of customers': totalcustomers}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400
    

# @app.route('/db/analysis/item/totalviews', methods=['GET'])
# def get_all_views():
#     totalviews = view.get_all_views_count()

#     try:
#         return jsonify({'Total Counts': totalviews}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# @app.route('/db/analysis/item/customerviews', methods=['GET'])
# def get_customers_views():
#     totalviews = view.get_customers_views()

#     try:
#         return jsonify({'Total Clicks': totalviews}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# @app.route('/db/analysis/item/customerclicks', methods=['GET'])
# def get_all_clicks():
#     totalclicks = view.get_all_clicks_count()

#     try:
#         return jsonify({'Total Clicks': totalclicks}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# @app.route('/db/analysis/item/customerclicks', methods=['GET'])
# def get_customers_clicks():
#     totalclicks = view.get_customers_clicks()

#     try:
#         return jsonify({'Total Clicks': totalclicks}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

# @app.route('/db/analysis/item/ordercounts', methods=['GET'])
# def get_all_orders():
#     order_counts = order.get_orders_count()

#     try:
#         return jsonify({'Order counts': order_counts}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run()



## customers clicks
## customers view