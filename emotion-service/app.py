import os
import flask
import librosa
import torch
from transformers import pipeline

# Initialize the Flask app
app = flask.Flask(__name__)

# Load the pre-trained Speech Emotion Recognition pipeline from Hugging Face
# This model is specifically trained for emotion recognition from speech
emotion_pipeline = pipeline("audio-classification", model="superb/wav2vec2-base-superb-er")

@app.route("/analyze_emotion", methods=["POST"])
def analyze_emotion():
    # Check if an audio file was uploaded
    if 'audio' not in flask.request.files:
        return flask.jsonify({"error": "No audio file provided"}), 400

    audio_file = flask.request.files['audio']
    
    # Save the file temporarily
    temp_filename = "temp_audio.wav"
    audio_file.save(temp_filename)

    try:
        # Load the audio file using librosa
        # The model requires a 16,000 Hz sample rate, so we resample it
        speech, sample_rate = librosa.load(temp_filename, sr=16000)

        # Get predictions from the model
        predictions = emotion_pipeline(speech, top_k=1)
        
        # The top prediction is the most likely emotion
        detected_emotion = predictions[0]['label']

        # Clean up the temporary file
        os.remove(temp_filename)

        # Return the result as JSON
        print(f"Detected Emotion: {detected_emotion}")
        return flask.jsonify({"emotion": detected_emotion})

    except Exception as e:
        # Clean up in case of an error
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        return flask.jsonify({"error": str(e)}), 500

# Start the server on port 5000
if __name__ == "__main__":
    app.run(port=5000)