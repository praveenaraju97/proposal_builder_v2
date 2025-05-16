import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from gridfs import GridFS
from config import config
from controllers.proposal_controller import create_proposal_blueprint
from utils.error_handler import handle_errors

def create_app(config_name='default'):
    # 1) Load the config class
    cfg = config[config_name]

    # 2) Compute absolute path to your frontend folder
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir  = os.path.abspath(os.path.join(backend_dir, cfg.STATIC_FOLDER))
    print(f"Serving static files from: {static_dir}")

    # 3) Tell Flask to use that folder as its static_folder at '/assets'
    app = Flask(
        __name__,
        static_folder=static_dir,
        static_url_path='/assets'
    )

    # 4) Now load the rest of your config
    app.config.from_object(cfg)

    # 5) Set up CORS, MongoDB, blueprints, etc.
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET","POST","PUT","DELETE","OPTIONS"],
            "allow_headers": ["Content-Type","Accept"]
        }
    })
    client = MongoClient(app.config['MONGO_URI'])
    db, fs = client['proposalbuilder'], GridFS(client['proposalbuilder'])
    app.register_blueprint(create_proposal_blueprint(db, fs), url_prefix='/api/proposals')
    handle_errors(app)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    return app

if __name__ == '__main__':
    create_app().run(debug=True)
