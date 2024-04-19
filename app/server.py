import io

import cv2
import numpy as np
import PyPDF2
import pytesseract
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from transformers import pipeline

model_name = "deepset/roberta-base-squad2"
nlp = pipeline('question-answering', model=model_name, tokenizer=model_name)



app = Flask(__name__)
CORS(app)


def grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def noise_removal(image):
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.dilate(image, kernel, iterations=1)
    image = cv2.erode(image, kernel, iterations=1)
    image = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
    return image


@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        image = Image.open(file.stream)
        image = np.array(image)
        gray_image = grayscale(image)
        thresh, im_bw = cv2.threshold(
            gray_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        no_noise = noise_removal(im_bw)
        ocr_result = pytesseract.image_to_string(no_noise, lang='en')

        return jsonify({'text': ocr_result})

    return jsonify({'error': 'An error occurred during file processing'})


@app.route('/read_pdf', methods=['POST'])
def read_pdf():
    try:
        # Get the PDF file from the request
        file = request.files['file']

        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))

        # Extract text from each page
        text = ''
        for page in range(len(pdf_reader.pages)):
            pdf_page = pdf_reader.pages[page]
            text += pdf_page.extract_text()

        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route("/ans", methods=["POST"])
def ans():
    data = request.get_json()
    question = data.get('question', None)
    context = data.get('context', None)
    res = nlp({'question': question, 'context': context})
    if res['score'] < 0.5: 
        return jsonify({"answer": 'The question cannot be confidently answered.'})
    else:
        return jsonify({"answer": res['answer']})



if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
