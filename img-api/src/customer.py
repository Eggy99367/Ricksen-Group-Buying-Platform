from flask import request, jsonify
from .models import db, Customer

def get_customers():
    try:
        customers = Customer.query.all()
        # print(customers)
        return jsonify([customer.get_info() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_customer(line_id):
    try:
        customer = Customer.query.get_or_404(line_id)
        return jsonify(customer.get_info())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def add_customer():
    try:
        data = request.json
        contents = ["line_id", "name", "phone", "email"]
        new_customer = Customer()

        for content in contents:
            if content in data:
                setattr(new_customer, content, data[content])
        db.session.add(new_customer)
        db.session.commit()
        return jsonify(new_customer.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def update_customer(line_id):
    try:
        print(1)
        contents = ["name", "phone", "email"]
        data = request.json
        customer = Customer.query.get_or_404(line_id)
        for content in contents:
            if content not in data or data[content] == "":
                data[content] = None
            setattr(customer, content, data[content])
        db.session.commit()
        return jsonify(customer.get_info())
    except Exception as e:
            return jsonify({'error': str(e)}), 400

def delete_customer(line_id):
    try:
        customer = Customer.query.get_or_404(line_id)
        db.session.delete(customer)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400