"use client";

import React, { useState, useEffect } from 'react';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.images) {
          setImages(data.images);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError('Failed to load images');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const calculateSavings = (original, compressed) => {
    const difference = original - compressed;
    const percentage = ((difference / original) * 100).toFixed(1);
    return `${percentage}% (${formatFileSize(difference)})`;
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowOriginal(false);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Image Gallery</h1>
      
      {loading && <div className="text-center py-6">Loading images...</div>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && images.length === 0 && (
        <div className="text-center py-6">No images found</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="border rounded overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img 
                src={image.compressedUrl} 
                alt={image.filename} 
                className="object-cover w-full h-48"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/400/400";
                }}
              />
            </div>
            <div className="p-3">
              <p className="font-medium text-gray-800 truncate">{image.filename}</p>
              <p className="text-sm text-gray-600">
                {image.width}×{image.height} · {image.mimeType.split('/')[1]}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Original: {formatFileSize(image.originalSize)}
              </p>
              <p className="text-xs text-green-600">
                Compressed: {formatFileSize(image.compressedSize)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Saved: {calculateSavings(image.originalSize, image.compressedSize)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">{selectedImage.filename}</h3>
              <div className="space-x-4 flex items-center">
                <div className="flex items-center">
                  <input
                    id="toggle-original"
                    type="checkbox"
                    checked={showOriginal}
                    onChange={() => setShowOriginal(!showOriginal)}
                    className="mr-2"
                  />
                  <label htmlFor="toggle-original" className="text-sm">Show original</label>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <img
                    src={showOriginal ? selectedImage.originalUrl : selectedImage.compressedUrl}
                    alt={selectedImage.filename}
                    className="max-w-full h-auto max-h-96 mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/400/400";
                    }}
                  />
                  <p className="text-center text-sm mt-2">
                    {showOriginal ? 'Original' : 'Compressed'} image
                  </p>
                </div>
                
                <div className="md:w-64 bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Image Details</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="text-gray-600 pr-3 py-1">Dimensions:</td>
                        <td>{selectedImage.width} × {selectedImage.height}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-3 py-1">Type:</td>
                        <td>{selectedImage.mimeType}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-3 py-1">Original size:</td>
                        <td>{formatFileSize(selectedImage.originalSize)}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-3 py-1">Compressed size:</td>
                        <td>{formatFileSize(selectedImage.compressedSize)}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-3 py-1">Space saved:</td>
                        <td className="text-green-600">{calculateSavings(selectedImage.originalSize, selectedImage.compressedSize)}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-600 pr-3 py-1">Uploaded on:</td>
                        <td>{new Date(selectedImage.createdAt).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <a 
                      href={selectedImage.originalUrl} 
                      download={selectedImage.filename}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Original
                    </a>
                    <a 
                      href={selectedImage.compressedUrl} 
                      download={`compressed-${selectedImage.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Compressed
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;