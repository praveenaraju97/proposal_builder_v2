## This is to convert ObjectId  to string in the response
## MongoDB uses ObjectId for unique identifiers, which are not JSON serializable.
## means jsonify cannot serialize ObjectId objects by default.

from bson import ObjectId

# def convert_object_ids(doc):
#     for key, value in doc.items():
#         if isinstance(value, ObjectId):
#             doc[key] = str(value)
#         elif isinstance(value, list):
#             doc[key] = [convert_object_ids(v) if isinstance(v, dict) else str(v) if isinstance(v, ObjectId) else v for v in value]
#         elif isinstance(value, dict):
#             doc[key] = convert_object_ids(value)
#     return doc


def convert_object_ids(obj):
    if isinstance(obj, dict):
        return {k: convert_object_ids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_object_ids(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj