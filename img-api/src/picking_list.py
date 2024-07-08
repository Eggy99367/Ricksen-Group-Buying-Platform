from flask import request, jsonify
from .models import db, Picking_List, Order_Record, Customer, Group_Record, Product
from .config import *
from .basics import *

def add_picking_list(date, customer_id):
    new_picking_list = Picking_List()

    all_ids = db.session.query(Picking_List.id).all()
    numeric_ids = [int(id[1:]) for id, in all_ids if id.startswith('L')]
    new_id = f"L{max(numeric_ids) + 1:04}" if len(numeric_ids) else "L0001"
    setattr(new_picking_list, "id", new_id)

    setattr(new_picking_list, "date", date)
    setattr(new_picking_list, "customer_id", customer_id)
    db.session.add(new_picking_list)
    db.session.commit()
    return new_id
    
def get_picking_list_id(customer_id, date):
    picking_list_id = Picking_List.query.filter(
            Picking_List.date == date,
            Picking_List.customer_id == customer_id
        ).all()
    if len(picking_list_id) > 0:
        return picking_list_id[0].id
    return add_picking_list(date, customer_id)

def get_picking_list():
    try:
        picking_lists = Picking_List.query.all()
        picking_lists = [picking_list.get_info() for picking_list in picking_lists]
        return jsonify(picking_lists)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_picking_list_dates():
    try:
        picking_list_datess = Picking_List.query.with_entities(Picking_List.date).all()
        picking_list_datess = sorted(list(set([pld[0] for pld in picking_list_datess])), reverse=True)
        return jsonify(picking_list_datess)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
def get_picking_list_by_date(date):
    try:
        pick_lsts = Picking_List.query.filter(Picking_List.date == date).all()
        pick_lsts = [lst.get_info() for lst in pick_lsts]

        result = []
        for pick_lst in pick_lsts:
            pl_info = {
                "id" : pick_lst["id"],
                "customer_id": pick_lst["customer_id"]
            }

            customer = Customer.query.get_or_404(pick_lst["customer_id"]).get_info()
            pl_info["customer_name"] = customer["name"]
            pl_info["customer_phone"] = customer["phone"]
            pl_info["customer_email"] = customer["email"]

            odrs = Order_Record.query.filter(Order_Record.picking_list_id == pick_lst["id"]).all()
            odrs = [odr.get_info() for odr in odrs]
            pl_info["odr_ids"] = [odr["id"] for odr in odrs]
            
            integrated_odrs = {}
            for odr in odrs:
                if odr["group_id"] not in integrated_odrs:
                    group = Group_Record.query.get_or_404(odr["group_id"]).get_info()
                    product = Product.query.get_or_404(group["product_id"]).get_info()
                    integrated_odrs[odr["group_id"]] = {
                        "group_id" : odr["group_id"],
                        "name" : product["name"],
                        "qty" : odr["qty"],
                        "price" : group["selling_price"]
                    }
                else:
                    integrated_odrs[odr["group_id"]]["qty"] += odr["qty"]
            integrated_odrs = [odr for _, odr in integrated_odrs.items()]
            pl_info["orders"] = integrated_odrs
            result.append(pl_info)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400