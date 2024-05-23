from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/suppliers')
def suppliers():
    return render_template('suppliers.html')

if __name__ == '__main__':
    app.run()
