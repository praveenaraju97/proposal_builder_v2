from models.proposal import Proposal
from bson import ObjectId
from datetime import datetime
from utils.error_handler import APIError

class ProposalService:
    def __init__(self, db, fs):
        self.model = Proposal(db, fs)

    def create_proposal(self, data, user_id):
        data['created_by'] = ObjectId(user_id)
        data['team_members'] = [{
            'user_id': ObjectId(user_id),
            'role': 'owner',
            'added_at': datetime.utcnow()
        }]
        proposal_id = self.model.create(data)
        return self.model.get_by_id(proposal_id)

    def get_proposals(self):
        proposals = self.model.get_all()
        # return [p for p in proposals if str(p['created_by']) == user_id or
        #         any(str(m['user_id']) == user_id for m in p.get('team_members', []))]
        return proposals 
       
    def get_specific_proposal(self,proposal_id):
        proposals = self.model.get_by_id(proposal_id)
        print(f"coming from service: {proposals}")
        return proposals  
    
    def delete_proposal(self,proposal_id):
        proposals = self.model.delete(proposal_id)
        print(f"coming from service for delete: {proposals}")
        return proposals 

    def update_proposal(self, proposal_id, data):
        proposal = self.model.get_by_id(proposal_id)
        if not proposal:
            raise APIError('Proposal not found', 404)

        # if str(proposal['created_by']) != user_id and not any(
        #     str(m['user_id']) == user_id and m['role'] in ['editor', 'owner']
        #     for m in proposal.get('team_members', [])
        # ):
        #     raise APIError('Unauthorized', 403)

        return self.model.update(proposal_id, data)

    def add_team_member(self, proposal_id, user_id, role, added_by):
        proposal = self.model.get_by_id(proposal_id)
        if not proposal:
            raise APIError('Proposal not found', 404)

        if any(str(m['user_id']) == user_id for m in proposal.get('team_members', [])):
            raise APIError('Already a team member', 400)

        if not any(str(m['user_id']) == added_by and m['role'] == 'owner'
                   for m in proposal.get('team_members', [])):
            raise APIError('Unauthorized to add', 403)

        new_member = {
            'user_id': ObjectId(user_id),
            'role': role,
            'added_at': datetime.utcnow()
        }

        return self.model.update(proposal_id, {
            '$push': {
                'team_members': new_member,
                'audit_log': {
                    'action': 'team_member_added',
                    'user_id': ObjectId(user_id),
                    'role': role,
                    'by': ObjectId(added_by),
                    'at': datetime.utcnow()
                }
            }
        })

    def upload_document(self, proposal_id, file, user_id):
        proposal = self.model.get_by_id(proposal_id)
        if not proposal:
            raise APIError('Proposal not found', 404)

        if str(proposal['created_by']) != user_id and not any(
            str(m['user_id']) == user_id and m['role'] in ['editor', 'owner']
            for m in proposal.get('team_members', [])
        ):
            raise APIError('Unauthorized', 403)

        file_id = self.model.save_document(file)
        version = self.model.add_version(proposal_id, file_id, user_id)

        self.model.update(proposal_id, {
            '$push': {
                'audit_log': {
                    'action': 'version_added',
                    'version': version,
                    'by': ObjectId(user_id),
                    'at': datetime.utcnow()
                }
            }
        })

        return version

    def get_document(self, proposal_id, version, user_id):
        proposal = self.model.get_by_id(proposal_id)
        if not proposal:
            raise APIError('Proposal not found', 404)

        for v in proposal.get('versions', []):
            if str(v['version']) == str(version):
                return self.model.get_document(v['document_id'])

        raise APIError('Version not found', 404)
