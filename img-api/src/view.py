from flask import request, jsonify
from .models import db, View_History
from .basics import *

def get_views():
    try:
        views = View_History.query.all()
        # print(views)
        return jsonify([view.get_info() for view in views])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def add_view():
    try:
        data = request.json
        contents = ["customer_id","group_id","view_type"]
        new_view = View_History()

        all_ids = db.session.query(View_History.id).all()
        numeric_ids = [int(id[1:]) for id, in all_ids if id.startswith('V')]
        new_id = f"V{max(numeric_ids) + 1:04}" if len(numeric_ids) else "V0001"
        setattr(new_view, "id", new_id)
        setattr(new_view, "timestamp", get_cur_time())

        for content in contents:
            if content in data:
                setattr(new_view, content, data[content])
        db.session.add(new_view)
        db.session.commit()
        return jsonify(new_view.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_all_views():
    try:
        views = View_History.query.filter_by(view_type="view").all()
        return jsonify([view.get_info() for view in views])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_all_clicks():
    try:
        views = View_History.query.filter_by(view_type="click").all()
        return jsonify([view.get_info() for view in views])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_views_by_group(grp_id):
    try:
        views = View_History.query.filter_by(group_id=grp_id).all()
        return jsonify([view.get_info() for view in views])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

## Get the total views from all customers(each customer count as one no matter how many times they view)
def get_customers_views_count():
    try:
        # Select distinct customer_id where view_type is "view"
        unique_customer_views = View_History.query.filter_by(view_type="view").group_by(View_History.customer_id).count()
    
        return jsonify({'Total Customers Views Counts': unique_customer_views}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

## Get the total views(count even the same customer views multiple time)
def get_all_views_count():
    try:
        total_views = View_History.query.filter_by(view_type="view").count()
        return jsonify({'Total Views Counts': total_views}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

## Get the total clics from all customers(each customer count as one no matter how many times they click)
def get_customers_clicks_count():
    try:
        # Select distinct customer_id where view_type is "view"
        unique_customer_views = View_History.query.filter_by(view_type="click").group_by(View_History.customer_id).count()
        # Generate a list of information for each unique customer view
        return jsonify({'Total Customers Clicks Counts': unique_customer_views}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

## Get the total clicks(count even the same customer clicks multiple time)
def get_all_clicks_count():
    try:
        total_views = View_History.query.filter_by(view_type="click").count()
        return jsonify({'Total Clciks Counts': total_views}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def check_viewer_exist(cust_id, grp_id):
    try:
        view_records = View_History.query.filter_by(group_id=grp_id, customer_id=cust_id, view_type="view").all()
        exists = bool(view_records)
        return jsonify({"exists": exists}), 200
    except Exception as e:
        print(f"Error checking viewer existence: {e}")
        return jsonify({"error": str(e)}), 500
    
def check_clicker_exist(cust_id, grp_id):
    try:
        view_records = View_History.query.filter_by(group_id=grp_id, customer_id=cust_id, view_type="click").all()
        exists = bool(view_records)
        return jsonify({"exists": exists}), 200
    except Exception as e:
        print(f"Error checking viewer existence: {e}")
        return jsonify({"error": str(e)}), 500
    

