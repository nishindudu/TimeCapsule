import os
import libsql
import uuid
import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')


database_url = os.getenv('DATABASE_URL')
token = os.getenv('TOKEN')

start_time = datetime.datetime.now()

request_count = {
    'browser': 0,
    'curl': 0
}

class TimeCapsule:
    def __init__(self, content, open_date, max_opens):
        self.content = content
        self.open_date = open_date
        self.max_opens = max_opens
        self.create_date = None # Will be set
        self.id = None # Will be updated when saved to database
        self.conn = libsql.connect(database=database_url, auth_token=token)

    def save(self):
        try:
            id = uuid.uuid4().hex
            now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            self.conn.execute("INSERT INTO Capsules (id, content, open_date, max_opens, create_date) VALUES (?, ?, ?, ?, ?)", (str(id), str(self.content), str(self.open_date), int(self.max_opens), str(now)))
            self.conn.commit()
            self.id = id
            return True
        except Exception as e:
            print(f"Error occurred while saving time capsule: {e}")
            return False
        
    def get_by_id(self, id):
        try:
            result = self.conn.execute("SELECT content, open_date, create_date, max_opens, opened FROM Capsules where id = ?", (str(id),)).fetchone()
            if result:
                self.content, self.open_date, self.create_date, self.max_opens, self.opened = result
                self.id = id
                if not datetime.datetime.now() < datetime.datetime.strptime(self.open_date, '%Y-%m-%d'):
                    self.conn.execute("UPDATE Capsules SET opened = opened + 1 WHERE id = ?", (str(id),))
                    self.conn.commit()
                if self.max_opens > 0 and self.opened >= self.max_opens:
                    self.conn.execute("DELETE FROM Capsules WHERE id = ?", (str(id),))
                    self.conn.commit()
                    return False
                return True
        except Exception as e:
            print(f"Error occurred while fetching time capsule: {e}")
            return False

    def get_number_of_capsules(self):
        try:
            result =self.conn.execute("SELECT COUNT(*) FROM Capsules")
            return result.fetchone()[0]
        except Exception as e:
            print(f"Error occurred while counting time capsules: {e}")
            return 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create', methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        content = request.json.get('content')
        open_date = request.json.get('open_date')
        max_opens = request.json.get('max_opens', 0)
        # print(f"Received content: {content}, open_date: {open_date}")
        # print(f"content: {content}, open: {open_date}")

        if not content or not open_date:
            print("Missing content or open date!")
            return jsonify({'message': 'Content and open date are required!'}), 400

        capsule = TimeCapsule(content, open_date, max_opens)
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
    capsule = TimeCapsule(None, None, None)
    if not capsule.get_by_id(capsule_id):
        return jsonify({'message': 'Time capsule not found!'}), 404
    current_date = datetime.datetime.now()
    open_date = datetime.datetime.strptime(capsule.open_date, '%Y-%m-%d')
    if current_date < open_date:
        return jsonify({'message': 'Time capsule is not open yet!', 'open_date': capsule.open_date}), 403
    return jsonify({'content': capsule.content}), 200

@app.route('/stats')
def stats():
    capsule = TimeCapsule(None, None, None)

    count = capsule.get_number_of_capsules()
    uptime = datetime.datetime.now() - start_time
    session_requests = request_count['browser'] + request_count['curl']

    return jsonify({'current_count': count, 'uptime': str(uptime), 'session_requests': session_requests}), 200


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.before_request
def count_requests():
    user_agent = request.headers.get('User-Agent', '').lower()
    if 'curl' in user_agent:
        request_count['curl'] += 1
    else:
        request_count['browser'] += 1


if __name__ == '__main__':
    app.run(debug=True)

