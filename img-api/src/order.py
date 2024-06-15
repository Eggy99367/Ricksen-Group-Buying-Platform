from flask import request, jsonify
from .models import db, Order_Record
from .basics import *

def get_orders():
    try:
        orders = Order_Record.query.all()
        # print(orders)
        return jsonify([order.get_info() for order in orders])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_orders_count():
    orders = Order_Record.query.all()
    return len(orders)
    
def get_order(id):
    try:
        order = Order_Record.query.get_or_404(id)
        return jsonify(order.get_info())
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_order_by_group(grp_id):
    try:
        orders = Order_Record.query.filter_by(group_id=grp_id).all()
        return jsonify([order.get_info() for order in orders])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def add_order():
    try:
        data = request.json
        contents = ["customer_id","group_id","qty","status"]
        new_order = Order_Record()

        all_ids = db.session.query(Order_Record.id).all()
        numeric_ids = [int(id[1:]) for id, in all_ids if id.startswith('X')]
        new_id = f"X{max(numeric_ids) + 1:04}" if len(numeric_ids) else "X0001"
        setattr(new_order, "id", new_id)
        setattr(new_order, "timestamp", get_cur_time())

        for content in contents:
            if content in data:
                setattr(new_order, content, data[content])
        db.session.add(new_order)
        db.session.commit()
        return jsonify(new_order.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def update_order(id):
    try:
        contents = ["customer_id","group_id","qty","status"]
        data = request.json
        order = Order_Record.query.get_or_404(id)
        for content in contents:
            if content not in data:
                continue
            if data[content] == "":
                data[content] = None
            setattr(order, content, data[content])
        db.session.commit()
        return jsonify(order.get_info())
    except Exception as e:
            return jsonify({'error': str(e)}), 400
    
def delete_order(id):
    try:
        order = Order_Record.query.get_or_404(id)
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': "success"}), 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    