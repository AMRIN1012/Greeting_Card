
from flask import Flask, request, jsonify, send_from_directory
import os
import csv
import uuid
from services.image_generator import generate_card_images

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
GENERATED_FOLDER = 'generated'
TEMPLATES_FOLDER = 'templates'

for folder in [UPLOAD_FOLDER, GENERATED_FOLDER, TEMPLATES_FOLDER]:
    os.makedirs(folder, exist_ok=True)

@app.route('/templates', methods=['GET'])
def get_templates():
    """Returns a list of available template images."""
    files = [f for f in os.listdir(TEMPLATES_FOLDER) if f.endswith(('.png', '.jpg', '.svg'))]
    return jsonify(files)

@app.route('/generate-single', methods=['POST'])
def generate_single():
    """Generates 3 sizes for a single record."""
    data = request.json
    try:
        results = generate_card_images(
            recipient=data['recipientName'],
            occasion=data['occasion'],
            message=data['message'],
            sender=data['senderName'],
            template_path=os.path.join(TEMPLATES_FOLDER, data['templateId'])
        )
        return jsonify({"status": "success", "images": results})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/generate-bulk', methods=['POST'])
def generate_bulk():
    """Reads a CSV and generates cards for each row."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    template_id = request.form.get('templateId')
    
    temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(temp_path)
    
    all_results = []
    with open(temp_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cards = generate_card_images(
                recipient=row['recipientName'],
                occasion=row['occasion'],
                message=row['message'],
                sender=row['senderName'],
                template_path=os.path.join(TEMPLATES_FOLDER, template_id)
            )
            all_results.extend(cards)
            
    return jsonify({"status": "success", "count": len(all_results), "images": all_results})

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(GENERATED_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
