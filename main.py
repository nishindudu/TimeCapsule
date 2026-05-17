import os
import libsql
import uuid
import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')


database_url = os.getenv('DATABASE_URL')
token = os.getenv('TOKEN')

class TimeCapsule:
    def __init__(self, content, open_date):
        self.content = content
        self.open_date = open_date
        self.id = None # Will be updated when saved to database
        self.conn = libsql.connect(database=database_url, auth_token=token)

    def save(self):
        try:
            id = uuid.uuid4().hex
            self.conn.execute("INSERT INTO Capsules (id, content, open_date) VALUES (?, ?, ?)", (str(id), str(self.content), str(self.open_date),))
            self.conn.commit()
            self.id = id
            return True
        except Exception as e:
            print(f"Error occurred while saving time capsule: {e}")
            return False
        
    def get_by_id(self, id):
        try:
            result = self.conn.execute("SELECT content, open_date FROM Capsules where id = ?", (str(id),)).fetchone()
            if result:
                self.content, self.open_date = result
                self.id = id
                return True
        except Exception as e:
            print(f"Error occurred while fetching time capsule: {e}")
            return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        content = request.json.get('content')
        open_date = request.json.get('open_date')
        print(f"Received content: {content}, open_date: {open_date}")
        # print(f"content: {content}, open: {open_date}")

        if not content or not open_date:
            print("Missing content or open date!")
            return jsonify({'message': 'Content and open date are required!'}), 400

        capsule = TimeCapsule(content, open_date)
        if not capsule.save():
            return jsonify({'message': 'Failed to create time capsule!'}), 500
        capsule_id = capsule.id
        return jsonify({'message': 'Time capsule created successfully!', 'id': capsule_id}), 201
    
    else:
        return render_template('create.html')
    
@app.route('/view', methods=['GET', 'POST'])
def view():
    return render_template('view.html')

@app.route('/view/<capsule_id>', methods=['GET'])
def view_capsule(capsule_id):
    capsule = TimeCapsule(None, None)
    if not capsule.get_by_id(capsule_id):
        return jsonify({'message': 'Time capsule not found!'}), 404
    current_date = datetime.datetime.now()
    open_date = datetime.datetime.strptime(capsule.open_date, '%Y-%m-%d')
    if current_date < open_date:
        return jsonify({'message': 'Time capsule is not open yet!', 'open_date': capsule.open_date}), 403
    return jsonify({'content': capsule.content}), 200

if __name__ == '__main__':
    app.run(debug=True)

