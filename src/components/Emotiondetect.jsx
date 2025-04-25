import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "./ui/Button";

const emotionEmoji = {
  angry: "😠",
  disgusted: "🤢",
  fearful: "😨",
  happy: "😄",
  neutral: "😐",
  sad: "😢",
  surprised: "😲",
};

const EmotionDetector = () => {
  const videoRef = useRef();
  const [expressions, setExpressions] = useState({});
  const [mainEmotion, setMainEmotion] = useState("Loading...");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const loadModels = async () => {
    const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    setModelsLoaded(true);
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Webcam error:", err));
  };

  const detectEmotion = async () => {
    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (result && result.expressions) {
      const expr = result.expressions;

      setExpressions(expr);

      const top = Object.entries(expr).reduce((a, b) => (a[1] > b[1] ? a : b));
      setMainEmotion(top[0]);
    }

    setTimeout(detectEmotion, 200);
  };

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) startVideo();
  }, [modelsLoaded]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("playing", detectEmotion);
    }
  }, [videoRef.current]);

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen bg-gray-800 text-white gap-6 p-4">
      <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-semibold">
        Emotion Detector
      </h1>

      {/* Webcam Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline // ✅ prevents fullscreen on iPhone
        muted
        className="w-full max-w-[640px] h-auto rounded-lg shadow-xl"
        style={{
          transform: "scaleX(-1)",
          transformOrigin: "center",
        }}
      />

      {/* Emotion Text */}
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium mt-4">
        Detected: {emotionEmoji[mainEmotion]} {mainEmotion.toUpperCase()}
      </h2>

      {/* Optional expressions debug (currently commented out) */}
      {/* 
    <div className="mt-4">
      {Object.entries(expressions).map(([emotion, confidence]) => (
        <div key={emotion}>
          {emotionEmoji[emotion]} {emotion} – {(confidence * 100).toFixed(2)}%
        </div>
      ))}
    </div> 
    */}
      <Button>
        <a href="/">Go Back</a>
      </Button>
    </div>
  );
};

export default EmotionDetector;
