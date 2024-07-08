# wait_for_mysql.py
import time
import pymysql
from sqlalchemy import create_engine

DB_HOST = "crm-db"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = "123456"
DB_NAME = "saas"

def wait_for_mysql():
    while True:
        try:
            engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
            connection = engine.connect()
            connection.close()
            print("MySQL is up and running!")
            break
        except Exception as e:
            print("Waiting for the MySQL server...")
            time.sleep(2)

if __name__ == "__main__":
    wait_for_mysql()
