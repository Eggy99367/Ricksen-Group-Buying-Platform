from flask import request, jsonify
from .models import db, Group_Record, Order_Record, Product, Picking_List
from .config import *
from .basics import *
from .picking_list import *
from .order import update_order_picking_list_id

def get_groups():
    try:
        groups = Group_Record.query.all()
        groups = [group.get_info() for group in groups]
        for index, product in enumerate(groups):
            groups[index]["product_name"] = f"{product["product_id"]}:{Product.query.get_or_404(product["product_id"]).get_info()["name"]}"
        # print(groups)
        return jsonify(groups)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_group(id):
    try:
        group = Group_Record.query.get_or_404(id).get_info()
        group["product_name"] = f"{group["product_id"]}:{Product.query.get_or_404(group["product_id"]).get_info()["name"]}"
        return jsonify(group)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_group_names():
    try:
        groups = db.session.query(Group_Record.id, Group_Record.product_id).all()
        names = {data.id: Product.query.get_or_404(data.product_id).name for data in groups}
        return jsonify(names)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_available_groups():
    try:
        groups = Group_Record.query.filter_by(status="團購進行中").all()
        return jsonify([group.get_info() for group in groups])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def add_group():
    try:
        data = request.json
        contents = ["product_id","selling_price","start_time","end_time","min_qty","max_qty","min_qty_pp","max_qty_pp"]
        new_group = Group_Record()

        all_ids = db.session.query(Group_Record.id).all()
        numeric_ids = [int(id[1:]) for id, in all_ids if id.startswith('G')]
        new_id = f"G{max(numeric_ids) + 1:04}" if len(numeric_ids) else "G0001"
        setattr(new_group, "id", new_id)
        setattr(new_group, "status", "準備開團")

        for content in contents:
            if content in data:
                setattr(new_group, content, data[content])
        db.session.add(new_group)
        db.session.commit()
        return jsonify(new_group.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def update_group(id):
    try:
        contents = ["product_id","selling_price","status","start_time","end_time","min_qty","max_qty","min_qty_pp","max_qty_pp"]
        data = request.json
        group = Group_Record.query.get_or_404(id)
        for content in contents:
            if content not in data:
                continue
            if data[content] == "":
                data[content] = None
            setattr(group, content, data[content])
        db.session.commit()
        return jsonify(group.get_info())
    except Exception as e:
            return jsonify({'error': str(e)}), 400
    
def stock_group(id):
    try:
        group = Group_Record.query.get_or_404(id)
        time = str(get_cur_time())
        if group.status != GroupStockedAwaitingPicking:
            setattr(group, "status", GroupStockedAwaitingPicking)
            setattr(group, "stocking_time", time)
            db.session.commit()
        else:
            return jsonify({'error': str(e)}), 400
        
        picking_date = get_picking_date(time)
        print("撿貨日期：", picking_date)
        # 找所有該團購的訂單
        orders = Order_Record.query.with_entities(Order_Record.id).filter(Order_Record.group_id == id).all()
        orders = [order[0] for order in orders]
        print("該團購項目所有訂單編號：", orders)
        for order in orders:
            update_order_picking_list_id(order, picking_date)
        return jsonify({})
    except Exception as e:
            return jsonify({'error': str(e)}), 400
    
def delete_group(id):
    try:
        group = Group_Record.query.get_or_404(id)
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': "success"}), 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400
