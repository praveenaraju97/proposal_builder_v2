folder structure
===============================

proposal_backend/
├── app.py                  # Main application file
├── requirements.txt        # Dependencies
├── config.py               # Configuration
|--- documentation.md
├── models/                 # Data models
│   ├── __init__.py
│   ├── proposal.py
│   ├── client.py
│   ├── user.py
│   └── template.py
├── services/               # Business logic
│   ├── __init__.py
│   ├── proposal_service.py
│   ├── client_service.py
│   ├── user_service.py
│   └── template_service.py
├── controllers/            # API endpoints
│   ├── __init__.py
│   ├── proposal_controller.py
│   ├── client_controller.py
│   ├── user_controller.py
│   └── template_controller.py
└── utils/                  # Utilities
    ├── __init__.py
    ├── auth.py
    ├── file_storage.py
    └── error_handler.py
	

API Endpoints
==================
Proposals
POST /api/proposals - Create a new proposal
GET /api/proposals - Get all proposals for current user
GET /api/proposals/<proposal_id> - Get a specific proposal
PUT /api/proposals/<proposal_id> - Update a proposal
POST /api/proposals/<proposal_id>/team - Add team member
POST /api/proposals/<proposal_id>/document - Upload document version
GET /api/proposals/<proposal_id>/document/<version> - Download document

Clients
POST /api/clients - Create client
GET /api/clients - Get all clients
GET /api/clients/<client_id> - Get specific client
PUT /api/clients/<client_id> - Update client
DELETE /api/clients/<client_id> - Delete client

Users
POST /api/users/register - Register new user
POST /api/users/login - Login user
GET /api/users - Get all users (admin only)
GET /api/users/<user_id> - Get user profile

Templates
POST /api/templates - Create template
GET /api/templates - Get all templates
GET /api/templates/<template_id> - Get specific template
PUT /api/templates/<template_id> - Update template
DELETE /api/templates/<template_id> - Delete template



=============================================