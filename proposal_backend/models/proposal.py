from datetime import datetime
from bson import ObjectId

class Proposal:
    def __init__(self, db, fs):
        self.collection = db['proposals']
        self.fs = fs

    def create(self, data):
        data['created_at'] = datetime.utcnow()
        data['updated_at'] = datetime.utcnow()
        data['current_version'] = 1
        data['versions'] = []
        data['audit_log'] = []
        result = self.collection.insert_one(data)
        return str(result.inserted_id)

    def get_all(self):
        proposals = list(self.collection.find())
        for p in proposals:
            p['_id'] = str(p['_id'])
            p['created_by'] = str(p.get('created_by', ''))
        return proposals

    def get_by_id(self, proposal_id):
        proposal = self.collection.find_one({'_id': ObjectId(proposal_id)})
        if proposal:
            proposal['_id'] = str(proposal['_id'])
            proposal['created_by'] = str(proposal.get('created_by', ''))
        return proposal

    def update(self, proposal_id, data):
        data['updated_at'] = datetime.utcnow()
        result = self.collection.update_one({'_id': ObjectId(proposal_id)}, {'$set': data} if '$' not in data else data)
        return result.modified_count > 0

    def add_version(self, proposal_id, file_id, user_id):
        proposal = self.get_by_id(proposal_id)
        new_version = proposal['current_version'] + 1

        self.collection.update_one(
            {'_id': ObjectId(proposal_id)},
            {
                '$push': {
                    'versions': {
                        'version': new_version,
                        'document_id': file_id,
                        'created_at': datetime.utcnow(),
                        'created_by': ObjectId(user_id)
                    }
                },
                '$set': {
                    'current_version': new_version,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return new_version

    def save_document(self, file_stream):
        return self.fs.put(file_stream)

    def get_document(self, file_id):
        return self.fs.get(ObjectId(file_id))
