import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar"; // Import the Navbar component
import "./FileUploader.css";
import pdfIcon from "../assets/pdf-icon.png";

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(e.dataTransfer.files),
      ]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...Array.from(e.target.files),
    ]);
  };

  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) {
      alert("Please upload at least one image!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await axios.post(
        "http://localhost:5000/convert-to-pdf",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setPdfUrl(response.data.pdfUrl);
    } catch (error) {
      console.error("Error uploading files", error);
      alert("An error occurred while converting the images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    // Reset the file list and scroll to the top
    setFiles([]);
    setPdfUrl("");
    window.scrollTo(0, 0); // Scroll to the top of the page
  };

  return (
    <div>
      <Navbar /> {/* Include the Navbar here */}
      <div className="container">
        <h2 className="title">Convert Your Image to PDF</h2>
        <img src={pdfIcon} alt="PDF Icon" className="pdf-icon" />

        {/* Drag and Drop Zone */}
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload").click()}
        >
          {files.length > 0 ? (
            <p>{files.length} file{files.length > 1 ? "s" : ""} selected</p>
          ) : (
            <p>Drag & drop files here, or click to upload</p>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="file-input"
        />

        {/* Image Previews with Remove Option */}
        <div className="image-preview-container">
          {files.length > 0 && (
            <ul className="image-preview-list">
              {files.map((file, index) => (
                <li key={index} className="image-preview-item">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="image-preview"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`upload-button ${isUploading ? "disabled" : ""}`}
        >
          {isUploading ? "Uploading..." : "Convert to PDF"}
        </button>

        {pdfUrl && (
          <div className="download-container">
            <p className="download-text">Your PDF is ready:</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
              onClick={handleDownload} // Trigger reset on download
            >
              Download PDF
            </a>
          </div>
        )}
      </div>

      <div className="slogan">
        <p>
          Easily Convert Your Images to High-Quality PDFs in Just a Few Clicks.
          Fast, Simple, and Hassle-Free – Enjoy a Seamless Conversion Experience
          with Instant Results, No Complicated Steps!
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
