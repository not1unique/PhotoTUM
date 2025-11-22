import os
import json
import pickle
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
# UPDATE THIS PATH to point to where the photos are stored in the friend's app.
# By default, it looks for an 'images' folder in the same directory as this script.
IMAGE_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../assets/images_hackatum2024'))

# Cache file for face encodings (will be created automatically)
CACHE_FILE = os.path.join(os.path.dirname(__file__), 'encodings_cache.pkl')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

print(f"--- FACE RECOGNITION SERVER ---")
print(f"Serving images from: {IMAGE_FOLDER}")
print(f"Cache file: {CACHE_FILE}")

# Global cache for face encodings
# Structure: { "filename.jpg": [encoding1, encoding2, ...] }
known_face_encodings = {}

# Try to import face_recognition
try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
    print("face_recognition library loaded successfully.")
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("WARNING: face_recognition library not found. Functionality will be limited.")
    print("To fix: pip install face_recognition")

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_face_encodings():
    """
    Pre-loads face encodings. Tries to load from disk cache first.
    If cache is missing or outdated, it scans the image folder.
    """
    global known_face_encodings

    if not FACE_RECOGNITION_AVAILABLE:
        return

    if not os.path.exists(IMAGE_FOLDER):
        print(f"Error: Image folder not found at {IMAGE_FOLDER}")
        print("Please create this folder and put images in it, or update IMAGE_FOLDER in server.py")
        return

    # 1. Try loading from pickle cache
    if os.path.exists(CACHE_FILE):
        try:
            print(f"Loading encodings from cache: {CACHE_FILE}")
            with open(CACHE_FILE, 'rb') as f:
                known_face_encodings = pickle.load(f)
            print(f"Loaded {len(known_face_encodings)} images from cache.")
            return
        except Exception as e:
            print(f"Failed to load cache, rebuilding: {e}")

    # 2. Rebuild cache if needed
    print("Indexing faces from images... this might take a while.")
    count = 0
    
    # Iterate over files
    for filename in os.listdir(IMAGE_FOLDER):
        if allowed_file(filename):
            filepath = os.path.join(IMAGE_FOLDER, filename)
            try:
                image = face_recognition.load_image_file(filepath)
                encodings = face_recognition.face_encodings(image)
                
                if len(encodings) > 0:
                    known_face_encodings[filename] = encodings
                    count += 1
            except Exception as e:
                print(f"Could not process {filename}: {e}")
    
    print(f"Indexed {count} images with faces.")
    
    # 3. Save to cache
    try:
        with open(CACHE_FILE, 'wb') as f:
            pickle.dump(known_face_encodings, f)
        print("Saved encodings to cache.")
    except Exception as e:
        print(f"Could not save cache: {e}")

# Initialize cache on startup
if FACE_RECOGNITION_AVAILABLE:
    load_face_encodings()

@app.route('/photos', methods=['GET'])
def get_photos():
    """Returns list of all photo URLs."""
    if not os.path.exists(IMAGE_FOLDER):
        return jsonify([]), 200

    photos = []
    try:
        for filename in os.listdir(IMAGE_FOLDER):
            if allowed_file(filename):
                photos.append({
                    "id": filename,
                    "uri": f"/images/{filename}",
                    "filename": filename
                })
    except Exception as e:
        print(f"Error scanning image folder: {e}")
        
    return jsonify(photos)

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

@app.route('/find_me', methods=['POST'])
def find_me():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not FACE_RECOGNITION_AVAILABLE:
        return jsonify({
            "message": "Face recognition not available (library missing).",
            "matches": []
        }), 503

    if file and allowed_file(file.filename):
        try:
            uploaded_image = face_recognition.load_image_file(file)
            uploaded_encodings = face_recognition.face_encodings(uploaded_image)
        except Exception as e:
             return jsonify({"error": f"Failed to process image: {str(e)}"}), 400

        if len(uploaded_encodings) == 0:
            return jsonify({
                "message": "No face found in the selfie.",
                "matches": []
            }), 200
        
        selfie_encoding = uploaded_encodings[0]
        matches = []
        
        print(f"Comparing selfie against {len(known_face_encodings)} images...")
        
        for filename, encodings_list in known_face_encodings.items():
            # Check if ANY face in the image matches the selfie
            results = face_recognition.compare_faces(encodings_list, selfie_encoding, tolerance=0.6)
            if True in results:
                matches.append(filename)

        return jsonify({
            "message": f"Found {len(matches)} matches.",
            "matches": matches
        })

    return jsonify({"error": "Invalid file type"}), 400

if __name__ == '__main__':
    # Using 0.0.0.0 to allow access from other devices (like the phone)
    app.run(host='0.0.0.0', port=5000, debug=True)

