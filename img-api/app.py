from flask import Flask, request, jsonify
from src.models import db, Customer, Supplier, Product, Group_Record, Order_Record, LastUpdated, User, Picking_List
from src import customer, supplier, product, group, order, view, picking_list
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from sqlalchemy import event
from src.basics import *
import pytz
from src.config import *

from apscheduler.schedulers.background import BackgroundScheduler
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

tables = [Customer, Supplier, Product, Group_Record, Order_Record, User, Picking_List]
for table in tables:
    table_name = table.__tablename__

    def create_after_insert_listener(table_name):
        def after_insert(mapper, connection, target):
            update_last_updated(table_name, connection)
            print(f"{str(get_cur_time())}: {table_name} {target.id} has been inserted.")
        return after_insert

    def create_after_update_listener(table_name):
        def after_update(mapper, connection, target):
            update_last_updated(table_name, connection)
            print(f"{str(get_cur_time())}: {table_name} {target.id} has been updated.")
        return after_update

    def create_after_delete_listener(table_name):
        def after_delete(mapper, connection, target):
            update_last_updated(table_name, connection)
            print(f"{str(get_cur_time())}: {table_name} {target.id} has been deleted.")
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

@app.route('/db/last_updated/all', methods=['GET'])
def get_db_last_updateds():
    try:
        last_updateds = LastUpdated.query.all()
        last_updateds = [last_updated.get_info()["time"] for last_updated in last_updateds] + ["0"]
        last = max(last_updateds)
        return jsonify(last)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ----------------------------------------------------------------------------------------

def update_group_status(item_id, new_status):
    item = Group_Record.query.get(item_id)
    if item:
        item.status = new_status
        db.session.commit()

def get_item_sells(group_id):
    orders = Order_Record.query.filter(
        Order_Record.group_id == group_id,
        Order_Record.status == "訂單確認"
    ).all()
    sells = sum([order.qty for order in orders])
    return sells

def check_and_update_status():
    with app.app_context():
        taiwan_tz = pytz.timezone('Asia/Taipei')
        now = datetime.now(taiwan_tz)

        # 把開團時間到的準備開團項目更新成團購進行中
        items_to_start = Group_Record.query.filter(
            Group_Record.status == GroupPreparingToStart
        ).all()
        for item in items_to_start:
            item_start_time = formatted_to_date(item.start_time)
            if item_start_time <= now:
                update_group_status(item.id, GroupInProgress)

        # 把收團時間到的進行中項目根據最小購買量更新狀態
        items_to_start = Group_Record.query.filter(
            Group_Record.status == GroupInProgress
        ).all()
        for item in items_to_start:
            if item.end_time:
                item_sells = get_item_sells(item.id)
                item_end_time = formatted_to_date(item.end_time)
                if item_end_time <= now:
                    if item.min_qty is not None and item_sells >= item.min_qty:
                        print(f"團購項目{item.id}已至收團時間，該項目已販售出{item_sells}個，已達成團最低門檻{item.min_qty}個")
                        update_group_status(item.id, GroupFormedAwaitingStocking)
                    else:
                        if item.min_qty is not None:
                            print(f"團購項目{item.id}已至收團時間，該項目已販售出{item_sells}個，未達到成團最低門檻{item.min_qty}個")
                        else:
                            print(f"團購項目{item.id}已至收團時間，該項目已販售出{item_sells}個，未設定成團最低門檻")
                        update_group_status(item.id, GroupEndedAwaitingDecision)

scheduler = BackgroundScheduler()
scheduler.add_job(check_and_update_status, 'interval', seconds=5)
scheduler.start()

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

@app.route('/db/stock/<string:id>', methods=['PUT'])
def stock_group(id):
    return group.stock_group(id)

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

@app.route('/db/views/check_buyer_exist/<string:cust_id>/<string:grp_id>', methods=['GET'])
def check_buyer_exist(cust_id, grp_id):
    return view.check_buyer_exist(cust_id, grp_id)

@app.route('/db/views/get_group_data_by_type/<string:grp_id>/<string:type>', methods=['GET'])
def get_group_data_by_type(grp_id, type):
    return view.get_group_data_by_type(grp_id, type)

# ----------------------------------------------------------------------------------------


@app.route('/db/picking_lists', methods=['GET'])
def get_picking_lists():
    return picking_list.get_picking_list()

@app.route('/db/picking_lists/dates', methods=['GET'])
def get_picking_lists_dates():
    return picking_list.get_picking_list_dates()

@app.route('/db/picking_lists/<string:date>', methods=['GET'])
def get_picking_list_by_date(date):
    return picking_list.get_picking_list_by_date(date)

@app.route('/db/picked/<string:date>', methods=['PUT'])
def pkl_picked_by_date(date):
    return picking_list.pkl_picked_by_date(date)

@app.route('/db/pick_up/<string:pkl_id>', methods=['PUT'])
def pick_up_by_pkl_id(pkl_id):
    return picking_list.pick_up_by_pkl_id(pkl_id)

# ----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run()