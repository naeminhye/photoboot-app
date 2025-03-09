// components/FrameControls/index.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import "./styles.css";

interface Sticker {
  id: number;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface FrameControlsProps {
  onColorChange: (color: string) => void;
  onBackgroundChange: (image: string | null) => void;
  onForegroundChange: (image: string | null) => void;
  layout: number;
  onLayoutChange: (layout: number) => void;
  capturedPhotos: string[];
  onReset: () => void;
  onPhotoUpload: (files: File[]) => void;
  photoStripRef: React.RefObject<HTMLDivElement>;
  frameColor: string;
  backgroundImage: string | null;
  foregroundImage: string | null;
  stickers: Sticker[];
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
  uploadedStickers: HTMLImageElement[];
  setUploadedStickers: React.Dispatch<React.SetStateAction<HTMLImageElement[]>>;
  timerEnabled: boolean;
  onTimerToggle: (enabled: boolean) => void;
}

const FrameControls: React.FC<FrameControlsProps> = ({
  onColorChange,
  onBackgroundChange,
  onForegroundChange,
  capturedPhotos,
  onReset,
  onPhotoUpload,
  photoStripRef,
  frameColor,
  backgroundImage,
  foregroundImage,
  stickers,
  setStickers,
  uploadedStickers,
  setUploadedStickers,
}) => {
  const [activeTab, setActiveTab] = useState("Background");

  const downloadImage = () => {
    const photoStrip = photoStripRef.current;
    if (photoStrip) {
      html2canvas(photoStrip, {
        scale: 2, // Tăng scale lên 2 (hoặc 3 nếu cần DPI cao hơn)
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = `photobooth_${Date.now()}.jpg`; // Đổi sang JPG
          link.href = canvas.toDataURL("image/jpeg", 1.0); // Chất lượng tối đa
          link.click();
        })
        .catch((error) => {
          console.error("Error generating canvas:", error);
        });
    }
  };

  const handleForegroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onForegroundChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onBackgroundChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStickerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newStickers = files.map((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      return img;
    });
    setUploadedStickers((prev) => [...prev, ...newStickers]);
  };

  const addStickerToCanvas = (stickerImg: HTMLImageElement) => {
    const newSticker: Sticker = {
      id: Date.now(),
      image: stickerImg,
      x: (3 * 96) / 2,
      y: (capturedPhotos.length * 2 * 96) / 2 || 96,
      width: 100,
      height: 100,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  return (
    <div className="frame-controls">
      <div className="tabs">
        <div className="tab-list">
          {["Background", "Foreground", "Stickers"].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === "Background" && (
            <div className="frame-controls-section">
              <label className="frame-controls-label">Background Color or Image</label>
              {!backgroundImage && (
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="frame-controls-color-input"
                />
              )}
              {backgroundImage ? (
                <div className="image-preview-container">
                  <img
                    className="image-preview"
                    src={backgroundImage}
                    alt="Background Preview"
                  />
                  <button
                    className="remove-button"
                    onClick={() => onBackgroundChange(null)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <label className="upload-button">
                  <FontAwesomeIcon icon={faUpload} /> Upload Background
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="frame-controls-file-input"
                    hidden
                  />
                </label>
              )}
            </div>
          )}
          {activeTab === "Foreground" && (
            <div className="frame-controls-section">
              <label className="frame-controls-label">Foreground Image</label>
              {foregroundImage ? (
                <div className="image-preview-container">
                  <img
                    className="image-preview"
                    src={foregroundImage}
                    alt="Foreground Preview"
                  />
                  <button
                    className="remove-button"
                    onClick={() => onForegroundChange(null)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ) : (
                <label className="upload-button">
                  <FontAwesomeIcon icon={faUpload} /> Upload Foreground
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleForegroundUpload}
                    className="frame-controls-file-input"
                    hidden
                  />
                </label>
              )}
            </div>
          )}
          {activeTab === "Stickers" && (
            <div className="frame-controls-section">
              <label className="frame-controls-label">Add Stickers</label>
              <label className="upload-button">
                <FontAwesomeIcon icon={faUpload} /> Upload Stickers
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleStickerUpload}
                  className="frame-controls-file-input"
                  hidden
                />
              </label>
              <div className="sticker-preview">
                {uploadedStickers.map((sticker, index) => (
                  <img
                    key={index}
                    src={sticker.src}
                    alt="Sticker"
                    className="sticker-item"
                    onClick={() => addStickerToCanvas(sticker)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="frame-controls-actions">
        <button
          className="frame-controls-button frame-controls-button-danger"
          onClick={onReset}
          style={{ display: capturedPhotos.length > 0 ? "inline-block" : "none" }}
        >
          Reset All
        </button>
        <button
          className="frame-controls-button frame-controls-button-success"
          onClick={downloadImage}
          style={{ display: capturedPhotos.length > 0 ? "inline-block" : "none" }}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default FrameControls;