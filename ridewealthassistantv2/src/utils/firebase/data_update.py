import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Provide the path to the JSON key file
cred = credentials.Certificate(
    "uberdriver-2941d-firebase-adminsdk-3t5g9-aec0b755d2.json"
)
firebase_admin.initialize_app(cred)

# Get a reference to the Firestore database
db = firestore.client()

# Specify the collection name
collection_name = "income"

# Retrieve all documents from the collection
docs = db.collection(collection_name).get()

# Iterate over each document and update the uid field
for doc in docs:
    doc_ref = db.collection(collection_name).document(doc.id)
    doc_ref.update({"uid": "MpmULPE4VUPQCnNin23zwwU7T8M2"})

print("Documents updated successfully.")
