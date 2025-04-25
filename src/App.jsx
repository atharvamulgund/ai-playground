// App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import EmotionDetector from "./components/Emotiondetect";
import AirDraw from "./components/AirDraw";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Adjust import paths as needed

const Index = () => {
  return (
    <div className=" w-full flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <Card className="w-full max-w-sm sm:max-w-md p-3 bg-gray-800 border-none shadow-2xl">
        <CardContent className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            AI Playground
          </h1>
          <p className="text-base sm:text-lg text-gray-300">
            Choose an application:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/emotiondetector" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Emotion Detector
              </Button>
            </Link>
            <Link to="/airdraw" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Air Draw
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400">
            Made with ❤️ by
            <a href="https://atharvamulgund.web.app/" className="px-2" target="_blank" rel="noopener noreferrer">
              Atharva Mulgund
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const App = () => {
  return (
  <div className="w-full">
      <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/emotiondetector" element={<EmotionDetector />} />
      <Route path="/airdraw" element={<AirDraw />} />
    </Routes>
  </div>
  );
};

export default App;
