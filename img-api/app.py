from flask import Flask, request, jsonify
from src.models import db, Customer, Supplier, Product, Group_Record, Order_Record
from src import customer, supplier, product, group, order, view

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@crm-db/saas'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# ----------------------------------------------------------------------------------------

@app.route('/db/customers', methods=['GET'])
def get_customers():
    return customer.get_customers()

@app.route('/db/customers/<string:line_id>', methods=['GET'])
def get_customer(line_id):
    return customer.get_customer(line_id)

@app.route('/db/customers', methods=['POST'])
def add_customer():
    return customer.add_customer()

@app.route('/db/customers/<string:line_id>', methods=['PUT'])
def update_customer(line_id):
    return customer.update_customer(line_id)

@app.route('/db/customers/<string:line_id>', methods=['DELETE'])
def delete_customer(line_id):
    return customer.delete_customer(line_id)

# ----------------------------------------------------------------------------------------

@app.route('/db/suppliers', methods=['GET'])
def get_suppliers():
    return supplier.get_suppliers()

@app.route('/db/suppliers/<string:id>', methods=['GET'])
def get_supplier(id):
    return supplier.get_supplier(id)

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

@app.route('/db/orders/by_pgrp/<string:grp_id>', methods=['GET'])
def get_views_by_group(grp_id):
    return order.get_views_by_group(grp_id)

# ----------------------------------------------------------------------------------------

if __name__ == '__main__':
    app.run()
