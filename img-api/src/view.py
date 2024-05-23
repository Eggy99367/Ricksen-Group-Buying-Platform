from flask import request, jsonify
from .models import db, View_History

from flask import request, jsonify
from .models import db, View_History

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
        contents = ["id","timestamp","customer_line_id","group_id","view_type"]
        new_view = View_History()

        max_id = db.session.query(db.func.max(View_History.id)).scalar()
        new_id = f"V{int(max_id[1:]) + 1:04}" if max_id else "V0001"
        setattr(new_view, "id", new_id)

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
    