import jwt
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
from bson import ObjectId
from config import Config
from models.user import User

def generate_token(user_id):
    payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow(),
        'sub': str(user_id)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        raise APIError('Token expired', 401)
    except jwt.InvalidTokenError:
        raise APIError('Invalid token', 401)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            user_id = decode_token(token)
            current_user = User.get_by_id(user_id)
            if not current_user:
                raise APIError('User not found', 404)
        except APIError as e:
            return jsonify({'message': str(e)}), e.status_code
            
        return f(current_user, *args, **kwargs)
        
    return decorated