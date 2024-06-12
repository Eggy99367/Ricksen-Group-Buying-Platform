from flask import request, jsonify
from .models import db, Supplier

def get_suppliers():
    try:
        suppliers = Supplier.query.all()
        # print(suppliers)
        return jsonify([supplier.get_info() for supplier in suppliers])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_supplier(id):
    try:
        supplier = Supplier.query.get_or_404(id)
        return jsonify(supplier.get_info())
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def add_supplier():
    try:
        data = request.json
        contents = ["name", "tax_id", "contact_person", "phone", "email"]
        new_supplier = Supplier()

        all_ids = db.session.query(Supplier.id).all()
        numeric_ids = [int(id[1:]) for id, in all_ids if id.startswith('S')]
        new_id = f"S{max(numeric_ids) + 1:04}" if len(numeric_ids) else "S0001"
        setattr(new_supplier, "id", new_id)

        for content in contents:
            if content in data:
                setattr(new_supplier, content, data[content])
        db.session.add(new_supplier)
        db.session.commit()
        return jsonify(new_supplier.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def update_supplier(id):
    try:
        contents = ["name", "tax_id", "contact_person", "phone", "email"]
        data = request.json
        supplier = Supplier.query.get_or_404(id)
        for content in contents:
            if content not in data:
                continue
            if data[content] == "":
                data[content] = None
            setattr(supplier, content, data[content])
        db.session.commit()
        return jsonify(supplier.get_info())
    except Exception as e:
            return jsonify({'error': str(e)}), 400
    
def delete_supplier(id):
    try:
        supplier = Supplier.query.get_or_404(id)
        db.session.delete(supplier)
        db.session.commit()
        return jsonify({'message': "success"}), 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400