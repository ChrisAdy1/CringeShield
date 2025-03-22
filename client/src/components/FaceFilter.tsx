import { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

interface FaceFilterProps {
  filterType: string;
  webcamRef: React.RefObject<any>;
}

export const FaceFilter: React.FC<FaceFilterProps> = ({ filterType, webcamRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      modelRef.current = await blazeface.load();
    };
    
    loadModel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!webcamRef.current || !webcamRef.current.video || !webcamRef.current.video.readyState === 4) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Stop previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const detectAndApplyFilter = async () => {
      if (!modelRef.current || !video || !ctx) return;

      // Draw the original video to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (filterType === 'none') {
        animationFrameRef.current = requestAnimationFrame(detectAndApplyFilter);
        return;
      }

      try {
        // Detect faces
        const predictions = await modelRef.current.estimateFaces(video, false);

        predictions.forEach((prediction: any) => {
          const start = prediction.topLeft as [number, number];
          const end = prediction.bottomRight as [number, number];
          const size = [end[0] - start[0], end[1] - start[1]] as [number, number];

          // Apply filters based on type
          switch (filterType) {
            case 'blur':
              // Save current state
              ctx.save();
              // Create a clipping region for the face
              ctx.beginPath();
              ctx.ellipse(
                start[0] + size[0] / 2,
                start[1] + size[1] / 2,
                size[0] / 1.5,
                size[1] / 1.6,
                0,
                0,
                2 * Math.PI
              );
              ctx.closePath();
              ctx.clip();
              
              // Apply blur filter to the clipped region
              ctx.filter = 'blur(15px)';
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Restore context
              ctx.restore();
              break;

            case 'cartoon':
              // Simple cartoon effect by exaggerating edges and reducing colors
              const imageData = ctx.getImageData(start[0], start[1], size[0], size[1]);
              const data = imageData.data;
              
              // Convert to cartoon-like (simplified implementation)
              for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.floor(data[i] / 32) * 32; // R
                data[i + 1] = Math.floor(data[i + 1] / 32) * 32; // G
                data[i + 2] = Math.floor(data[i + 2] / 32) * 32; // B
              }
              
              ctx.putImageData(imageData, start[0], start[1]);
              
              // Draw outline
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.ellipse(
                start[0] + size[0] / 2,
                start[1] + size[1] / 2,
                size[0] / 1.5,
                size[1] / 1.6,
                0,
                0,
                2 * Math.PI
              );
              ctx.stroke();
              break;

            case 'silhouette':
              // Draw a black silhouette
              ctx.fillStyle = 'black';
              ctx.beginPath();
              ctx.ellipse(
                start[0] + size[0] / 2,
                start[1] + size[1] / 2,
                size[0] / 1.5, 
                size[1] / 1.6,
                0,
                0, 
                2 * Math.PI
              );
              ctx.fill();
              break;

            default:
              break;
          }
        });
      } catch (error) {
        console.error('Error in face detection:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectAndApplyFilter);
    };

    detectAndApplyFilter();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [filterType, webcamRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      style={{ display: filterType === 'none' ? 'none' : 'block' }}
    />
  );
};
