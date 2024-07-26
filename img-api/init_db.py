from app import app, db
from src.models import User


with app.app_context():
    db.create_all()

    initial_email = "admin@example.com"
    initial_password = "adminpassword"
    
    if not User.query.filter_by(email=initial_email).first():
        user = User(email=initial_email)
        user.set_password(initial_password)
        db.session.add(user)
        db.session.commit()
        print(f"Initialized database with user: {initial_email}")

    
