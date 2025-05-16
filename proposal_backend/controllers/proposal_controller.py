from flask import Blueprint, request, jsonify, send_file
from services.proposal_service import ProposalService
# from utils.auth import token_required
from bson import ObjectId
from io import BytesIO
from utils.helpers import convert_object_ids

def create_proposal_blueprint(db, fs):
    proposal_service = ProposalService(db, fs)
    blueprint = Blueprint('proposal', __name__)

    @blueprint.route('', methods=['POST'])
    ##@token_required
    # def create_proposal(current_user):
    def create_proposal():
        data = request.get_json()
        # proposal = proposal_service.create_proposal(data, str(current_user['_id']))
        proposal = proposal_service.create_proposal(data, "60f5a4f3a5c7e4a4f8b2b7b2")
        proposal = convert_object_ids(proposal)
        return jsonify(proposal), 201

    @blueprint.route('', methods=['GET'])
    ##@token_required
    # def get_proposals(current_user):
    def get_proposals():
        proposals = proposal_service.get_proposals()
        proposals = convert_object_ids(proposals)
        return jsonify(proposals), 200
    
    @blueprint.route('/<proposal_id>', methods=['GET'])
    ##@token_required
    # def get_proposals(current_user):
    def get_specific_proposals(proposal_id):
        proposals = proposal_service.get_specific_proposal(proposal_id)
        proposals = convert_object_ids(proposals)
        return jsonify(proposals), 200

    @blueprint.route('/<proposal_id>', methods=['PUT'])
    #@token_required
    # def update_proposal(current_user, proposal_id):
    def update_proposal(proposal_id):
        data = request.get_json()
        # updated = proposal_service.update_proposal(proposal_id, data, str(current_user['_id']))
        updated = proposal_service.update_proposal(proposal_id, data)
        return jsonify({'success': updated}), 200
    
    @blueprint.route('/<proposal_id>', methods=['DELETE'])
    #@token_required
    # def update_proposal(current_user, proposal_id):
    def delete_proposal(proposal_id):
        data = request.get_json()
        # updated = proposal_service.update_proposal(proposal_id, data, str(current_user['_id']))
        deleted = proposal_service.delete_proposal(proposal_id)
        print(f"deleted processing in controller: {deleted}")
        return jsonify({'success': deleted}), 200

    @blueprint.route('/<proposal_id>/team', methods=['POST'])
    #@token_required
    def add_team_member(current_user, proposal_id):
        data = request.get_json()
        success = proposal_service.add_team_member(
            proposal_id,
            data['user_id'],
            data['role'],
            str(current_user['_id'])
        )
        return jsonify({'success': success}), 200

    @blueprint.route('/<proposal_id>/document', methods=['POST'])
    #@token_required
    def upload_document(current_user, proposal_id):
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        version = proposal_service.upload_document(
            proposal_id,
            file,
            str(current_user['_id'])
        )
        return jsonify({'version': version}), 201

    @blueprint.route('/<proposal_id>/document/<version>', methods=['GET'])
    #@token_required
    def download_document(current_user, proposal_id, version):
        document = proposal_service.get_document(proposal_id, version, str(current_user['_id']))
        return send_file(
            BytesIO(document.read()),
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=f'proposal_{proposal_id}_v{version}.docx'
        )

    return blueprint
