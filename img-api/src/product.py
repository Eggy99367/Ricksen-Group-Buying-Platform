from flask import request, jsonify
from .models import db, Product

def get_products():
    try:
        products = Product.query.all()
        # print(products)
        return jsonify([product.get_info() for product in products])
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_product(id):
    try:
        product = Product.query.get_or_404(id)
        return jsonify(product.get_info())
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def add_product():
    try:
        data = request.json
        contents = ["name", "cost", "supplier_id", "description", "img"]
        new_product = Product()

        max_id = db.session.query(db.func.max(Product.id)).scalar()
        new_id = f"P{int(max_id[1:]) + 1:04}" if max_id else "P0001"
        setattr(new_product, "id", new_id)

        for content in contents:
            if content in data:
                setattr(new_product, content, data[content])
        db.session.add(new_product)
        db.session.commit()
        return jsonify(new_product.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def update_product(id):
    try:
        contents = ["name", "cost", "supplier_id", "description", "img"]
        data = request.json
        product = Product.query.get_or_404(id)
        for content in contents:
            if content not in data:
                continue
            if data[content] == "":
                data[content] = None
            setattr(product, content, data[content])
        db.session.commit()
        return jsonify(product.get_info())
    except Exception as e:
            return jsonify({'error': str(e)}), 400
    
def delete_product(id):
    try:
        product = Product.query.get_or_404(id)
        db.session.delete(product)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400