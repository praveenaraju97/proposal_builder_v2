from flask import jsonify

class APIError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def handle_errors(app):
    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify({
            'error': error.message,
            'status': error.status_code
        })
        response.status_code = error.status_code
        return response
        
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
        
    @app.errorhandler(500)
    def handle_server_error(error):
        return jsonify({'error': 'Internal server error'}), 500