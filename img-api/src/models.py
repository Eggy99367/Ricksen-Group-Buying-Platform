# models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Customer(db.Model):
    __tablename__ = 'customer'
    line_id = db.Column(db.String(40), primary_key=True, nullable=False, unique=True)
    name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(80), nullable=False)

    def get_info(self):
        return {
            "line_id": self.line_id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email
        }

    def __repr__(self):
        return f'<Customer {self.name}>'

class Supplier(db.Model):
    __tablename__ = 'supplier'
    id = db.Column(db.String(10), primary_key=True, nullable=False, unique=True)
    name = db.Column(db.String(50), nullable=False)
    tax_id = db.Column(db.String(8))
    contact_person = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(80), nullable=False)

    def get_info(self):
        return {
            "id": self.id,
            "name": self.name,
            "tax_id": self.tax_id,
            "contact_person": self.contact_person,
            "phone": self.phone,
            "email": self.email
        }

    def __repr__(self):
        return f'<Supplier {self.name}>'

class Product(db.Model):
    __tablename__ = 'product'
    id = db.Column(db.String(10), primary_key=True, nullable=False, unique=True)
    name = db.Column(db.String(40), nullable=False)
    cost = db.Column(db.Integer, nullable=False)
    supplier_id = db.Column(db.String(10), db.ForeignKey('supplier.id'), nullable=False)
    description = db.Column(db.String(60))
    img = db.Column(db.String(2000))

    def get_info(self):
        return {
            "id": self.id,
            "name": self.name,
            "cost": self.cost,
            "supplier_id": self.supplier_id,
            "description": self.description,
            "img": self.img
        }

    def __repr__(self):
        return f'<Product {self.name}>'

class Group_Record(db.Model):
    __tablename__ = 'group_record'
    id = db.Column(db.String(10), primary_key=True, nullable=False, unique=True)
    product_id = db.Column(db.String(10), db.ForeignKey('product.id'), nullable=False)
    selling_price = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(10), nullable=False)
    start_time = db.Column(db.Integer, nullable=False)
    end_time = db.Column(db.Integer)
    min_qty = db.Column(db.Integer)
    max_qty = db.Column(db.Integer)
    min_qty_per_customer = db.Column(db.Integer)
    max_qty_per_customer = db.Column(db.Integer)
    
    def get_info(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "selling_price": self.selling_price,
            "status": self.status,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "min_qty": self.min_qty,
            "max_qty": self.max_qty,
            "min_qty_per_customer": self.min_qty_per_customer,
            "max_qty_per_customer": self.max_qty_per_customer
        }

    def __repr__(self):
        return f'<Group_Record {self.id}>'
    
class Order_Record(db.Model):
    __tablename__ = 'order_record'
    id = db.Column(db.String(10), primary_key=True, nullable=False, unique=True)
    timestamp = db.Column(db.Integer, nullable=False)
    customer_line_id = db.Column(db.String(10), db.ForeignKey('customer.line_id'), nullable=False)
    group_id = db.Column(db.String(10), db.ForeignKey('group_record.id'), nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(10), nullable=False)

    def get_info(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "customer_line_id": self.customer_line_id,
            "group_id": self.group_id,
            "qty": self.qty,
            "status": self.status
        }

    def __repr__(self):
        return f'<Order_Record {self.id}>'
    
class View_History(db.Model):
    __tablename__ = 'view_history'
    id = db.Column(db.String(10), primary_key=True, nullable=False, unique=True)
    timestamp = db.Column(db.Integer, nullable=False)
    customer_line_id = db.Column(db.String(10), db.ForeignKey('customer.line_id'), nullable=False)
    group_id = db.Column(db.String(10), db.ForeignKey('group_record.id'), nullable=False)
    view_type = db.Column(db.String(10), nullable=False)

    def get_info(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "customer_line_id": self.customer_line_id,
            "group_id": self.group_id,
            "view_type": self.view_type
        }

    def __repr__(self):
        return f'<View_History {self.id}>'