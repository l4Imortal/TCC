import os
from flask import Flask, jsonify
from database import get_db_connection, close_db_connection
app = Flask(__name__)
@app.route('/')
def home():
 return jsonify({"message": "Aplicação Python com PostgreSQL no Docker"})
@app.route('/users')
def get_users():
 conn = get_db_connection()
 cursor = conn.cursor()
 cursor.execute('SELECT id, username, email FROM users')
 users = cursor.fetchall()
 cursor.close()
 close_db_connection(conn)

 return jsonify([
 {"id": user[0], "username": user[1], "email": user[2]}
 for user in users
 ])
@app.route('/healthcheck')
def healthcheck():
 return jsonify({"status": "healthy"})
if __name__ == '__main__':
 app.run(host='0.0.0.0', port=8000)