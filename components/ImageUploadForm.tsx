"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

interface UploadResponse {
  success: boolean;
  image: {
    originalUrl: string;
  };
  error: string;
}

const ImageUploadForm = ({onUploadSuccess}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    // Create preview when file is selected
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Free memory when component unmounts or when file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
      return undefined;
    }
  }, [file]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
      setUploadedImageUrl(''); // Clear previous upload results
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setUploadedImageUrl(data.image.originalUrl);

      // Call the success callback with the uploaded image data
      if (onUploadSuccess) {
        onUploadSuccess(data.image);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Image Upload</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Select an image:
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
            />
            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="ml-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
            <div className="border rounded-lg overflow-hidden bg-white">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto object-contain max-h-64"
              />
            </div>
            {file && (
              <div className="mt-2 text-xs text-gray-500">
                <p>Name: {file.name}</p>
                <p>Size: {formatFileSize(file.size)}</p>
                <p>Type: {file.type}</p>
              </div>
            )}
          </div>
        )}

        <button 
          type="submit" 
          disabled={uploading || !file} 
          className={`w-full py-2 px-4 rounded-md text-white font-medium
                    ${!file 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : uploading 
                        ? 'bg-blue-400 cursor-wait' 
                        : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {uploadedImageUrl && (
        <div className="mt-4">
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded mb-3">
            Image uploaded successfully!
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploadForm;
