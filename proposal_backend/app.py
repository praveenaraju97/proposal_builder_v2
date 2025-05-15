from flask import Flask
from pymongo import MongoClient
from gridfs import GridFS
from flask_cors import CORS
from config import config
from controllers.proposal_controller import create_proposal_blueprint
from utils.error_handler import handle_errors
import os


def create_app(config_name='default'):
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    app.config.from_object(config[config_name])

    # MongoDB setup
    client = MongoClient(app.config['MONGO_URI'])
    db = client['proposalbuilder']
    fs = GridFS(db)

    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://127.0.0.1:5000:5000"]
        }
    })

    
    # Register blueprint with db and fs
    app.register_blueprint(create_proposal_blueprint(db, fs), url_prefix='/api/proposals')

    # Error handling
    handle_errors(app)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
