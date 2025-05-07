from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

# .env dosyasını yükle
load_dotenv()

# API key'i al
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Google Gemini'yi yapılandır
genai.configure(api_key=GEMINI_API_KEY)

# Flask uygulaması başlat
app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Gemini chatbot API!"})

@app.route('/ask', methods=['POST'])
def ask_bot():
    user_input = request.json.get('message')
    quiz_data = request.json.get('quizData')  # Get quizData from the request
    
    # Extract correct and incorrect answers from quizData
    correctAnswers = quiz_data.get('correctAnswers', 0)  # Use .get() to avoid KeyError and default to 0 if missing
    incorrectAnswers = quiz_data.get('incorrectAnswers', 0)  # Same for incorrectAnswers
    quizResults = quiz_data.get('quizResults', [])  # Default to an empty list if quizResults is missing

    # Define content structure for suggestions (without hardcoded logic)
    content = {
        "Math Unit Quizzes": [
            "Addition And Subtraction Operations",
            "Multiples And Factors",
            "Fractions",
            "Time And Clocks",
            "Length And Weight Measurements",
            "Geometric Shapes Basic",
            "Even And Odd Numbers",
            "Word And Story Problems",
            "Division Operations",
            "Money Calculations"
        ],
        "Science Unit Quizzes": [
            "The Magic Of Magnets",
            "Our Colorful Earth",
            "Weather Watchers",
            "The Human Body And Senses",
            "The Water Cycle"
        ],
        "English Unit Quizzes": [
            "Alphabet And Phonics",
            "Colors And Shapes",
            "Numbers And Counting",
            "Fruits And Vegetables",
            "My Family And Friends",
            "Daily Routines",
            "Weather And Clothes",
            "Feelings And Emotions"
        ],
        "Math Unit Exercises": [
            "Dice Game",
            "Bar Graph Reading",
            "Even or Odd?"
        ],
        "Science Unit Exercises": [
            "Weather Thermometer Challenge",
            "Float or Sink?",
            "Magnetic or Not?"
        ],
        "English Unit Exercises": [
            "Audio Recognition",
            "Word Match",
            "Word Sorting Game"
        ],
        "Math Unit Activities": [
            "Puzzle",
            "Shape Drag",
            "Matching"
        ],
        "Science Unit Activities": [
            "Plant Growth Game",
            "Color Mixing Lab",
            "States of Matter Lab"
        ],
        "English Unit Activities": [
            "Word Puzzle",
            "Word Freeze",
            "Phonic Pop!"
        ]
    }

    try:
        # Convert the content dictionary to a string
        content_str = json.dumps(content)

        # Create the full prompt by combining user input with the content string
        prompt = f"""
        You are a helpful assistant for a learning platform. Based on the following quiz results and the user's message, please suggest an activity, exercise, or quiz for further study. You can recommend an activity or exercise according to quiz results. The user's total correct answers are: {correctAnswers}. The total incorrect answers are: {incorrectAnswers}. The user's quiz results: {json.dumps(quizResults)}.

        If the user asks for recommending exercises, quizzes, activities : {json.dumps(content)}.
        
        Please suggest an area for the user to focus on based on their progress. The user’s question is: "{user_input}"

        Focus primarily on answering the user's question in a meaningful way. If the user asks questions unrelated to the site or learning progress, kindly provide a helpful answer while gently encouraging them to return to the platform to continue their educational journey. 

        If the user's question is related to the site, briefly explain how the platform can help them improve their knowledge and encourage them to keep learning. Make sure the response is clear, concise, and easy to understand, but still informative.

        Keep the answers short, clear, and engaging, encouraging further interaction with the learning platform.
        """

        # Gemini modeliyle içerik üret
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        return jsonify({'response': response.text})
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
