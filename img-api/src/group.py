from flask import request, jsonify
from .models import db, Group_Record

def get_groups():
    try:
        groups = Group_Record.query.all()
        # print(groups)
        return jsonify([group.get_info() for group in groups])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_group(id):
    try:
        group = Group_Record.query.get_or_404(id)
        return jsonify(group.get_info())
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def add_group():
    try:
        data = request.json
        contents = ["product_id","selling_price","status","start_time","end_time","min_qty","max_qty","min_qty_pp","max_qty_pp"]
        new_group = Group_Record()

        max_id = db.session.query(db.func.max(Group_Record.id)).scalar()
        new_id = f"G{int(max_id[1:]) + 1:04}" if max_id else "G0001"
        setattr(new_group, "id", new_id)

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
    
def delete_group(id):
    try:
        group = Group_Record.query.get_or_404(id)
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': "success"}), 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400