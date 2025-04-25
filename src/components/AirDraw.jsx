import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { Button } from "./ui/Button";

const AirDraw = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [drawing, setDrawing] = useState(true);
  const [color, setColor] = useState("cyan");
  const [eraseMode, setEraseMode] = useState(false);
  const [drawCircle, setDrawCircle] = useState(false);
  const prevPos = useRef(null);
  const prevPosMap = useRef({});

  // Setup MediaPipe Hands and drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    const fingerIndices = [4, 8, 12, 16]; // Index, Middle, Ring fingertips
    // multiple fingers
    hands.onResults((results) => {
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        fingerIndices.forEach((index) => {
          const fingerTip = landmarks[index];
          const x = fingerTip.x * canvas.width;
          const y = fingerTip.y * canvas.height;

          if (drawing && fingerTip) {
            if (eraseMode) {
              ctx.clearRect(x - 10, y - 10, 20, 20);
            } else {
              const prev = prevPosMap.current[index];

              if (prev && !drawCircle) {
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(x, y);
                ctx.stroke();
              }

              if (drawCircle) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();
              }

              prevPosMap.current[index] = { x, y };
            }
          } else {
            prevPosMap.current[index] = null;
          }
        });
      }
    });

    // pinch
    // hands.onResults((results) => {
    //   if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    //     const landmarks = results.multiHandLandmarks[0];
    //     const indexFingerTip = landmarks[8];
    //     const thumbTip = landmarks[4];

    //     const x = indexFingerTip.x * canvas.width;
    //     const y = indexFingerTip.y * canvas.height;

    //     // 🔍 Detect Pinch (index + thumb close together)
    //     const dx = indexFingerTip.x - thumbTip.x;
    //     const dy = indexFingerTip.y - thumbTip.y;
    //     const pinchDistance = Math.sqrt(dx * dx + dy * dy);

    //     const isPinching = pinchDistance < 0.05; // Adjust this threshold if needed

    //     if (isPinching && indexFingerTip) {
    //       // 🟢 Drawing Mode Active
    //       if (prevPos.current) {
    //         const moveDx = x - prevPos.current.x;
    //         const moveDy = y - prevPos.current.y;
    //         const moveDistance = Math.sqrt(moveDx * moveDx + moveDy * moveDy);

    //         if (moveDistance > 50) {
    //           prevPos.current = null; // Big jump? Start new stroke
    //         }
    //       }

    //       if (eraseMode) {
    //         ctx.clearRect(x - 10, y - 10, 20, 20);
    //       } else {
    //         if (prevPos.current) {
    //           ctx.beginPath();
    //           ctx.moveTo(prevPos.current.x, prevPos.current.y);
    //           if (drawCircle) {
    //             ctx.arc(x, y, 10, 0, 2 * Math.PI);
    //           } else {
    //             ctx.lineTo(x, y);
    //           }
    //           ctx.strokeStyle = color;
    //           ctx.lineWidth = 3;
    //           ctx.stroke();
    //         }
    //       }

    //       prevPos.current = { x, y };
    //     } else {
    //       // ❌ Not drawing, just move cursor
    //       prevPos.current = null;
    //     }
    //   }
    // });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [drawing, eraseMode, drawCircle, color]); // ✅ Watch `color` here to fix the color bug

  // Clear entire canvas
  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Save current drawing as PNG
  const saveArtwork = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Create a temp canvas to merge video + drawing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const ctx = tempCanvas.getContext("2d");

    // Flip entire canvas once (mirror effect to match UI)
    ctx.save();
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);

    // Draw video and drawing both mirrored
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    ctx.restore();

    // Convert to image
    const imageUrl = tempCanvas.toDataURL("image/png");

    // Trigger download
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "airdraw_art.png";
    link.click();
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white p-4 gap-4">
  <h1 className="text-center text-xl font-semibold">Doodle Classifier</h1>

  {/* Video + Canvas Wrapper */}
  <div className="relative w-full max-w-[640px] sm:aspect-video aspect-[4/3] border border-gray-300">
    {/* Webcam Feed */}
    <video
      ref={videoRef}
      className="absolute top-0 left-0 w-full h-full object-cover z-0 scale-x-[-1]"
      autoPlay
      playsInline
      muted
    />

    {/* Drawing Canvas */}
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-10 scale-x-[-1]"
    />
  </div>

  {/* Buttons Below */}
  <div className="w-full max-w-[640px] flex flex-wrap justify-center gap-2 bg-white/80 p-3 rounded">
    {/* <Button
      onClick={() =>
        setDrawing((prev) => {
          if (!prev) prevPosMap.current = {}; // Reset when resuming
          return !prev;
        })
      }
    >
      {drawing ? "Pause" : "Draw"}
    </Button> */}

    <Button onClick={() => setDrawCircle((prev) => !prev)}>
      {drawCircle ? "Circle" : "Line"}
    </Button>

    <Button onClick={clearCanvas} className="bg-red-600 text-white">
      Clear
    </Button>

    <Button onClick={saveArtwork} className="bg-green-600 text-white">
      Save
    </Button>
    <Button className="bg-green-600 text-white">
      <a href="/">Go Back</a>
    </Button>
  </div>
</div>

  );
};

export default AirDraw;
