from flask import request, jsonify
from .models import db, Customer
import json
def get_customers_count():
    customers = Customer.query.all()
    return len(customers)

def get_customers():
    try:
        customers = Customer.query.all()
        # print(customers)
        return jsonify([customer.get_info() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def get_customer(id):
    try:
        customer = Customer.query.get_or_404(id)
        return jsonify(customer.get_info())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def add_customer():
    try:
        data = request.json
        contents = ["id", "name", "phone", "email"]
        new_customer = Customer()

        for content in contents:
            if content in data:
                setattr(new_customer, content, data[content])
            else:
                setattr(new_customer, content, "")

        if "state" in data:
            setattr(new_customer, "state", json.dumps(data["state"]))
        else:
            setattr(new_customer, "state", json.dumps({"state": "message"}))  # Default to empty dict if not provided

        db.session.add(new_customer)
        db.session.commit()
        return jsonify(new_customer.get_info()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def update_customer(id):
    try:
        print(1)
        contents = ["name", "phone", "email", "state"]
        data = request.json
        customer = Customer.query.get_or_404(id)
        for content in contents:
            if content not in data:
                continue
            if data[content] == "":
                data[content] = None
            setattr(customer, content, data[content])
        db.session.commit()
        return jsonify(customer.get_info())
    except Exception as e:
            return jsonify({'error': str(e)}), 400

def delete_customer(id):
    try:
        customer = Customer.query.get_or_404(id)
        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': "success"}), 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400
