"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';

interface UploadResponse {
  success: boolean;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

export default function ImageUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uploadDetails, setUploadDetails] = useState<{
    size?: number;
    type?: string;
  } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadDetails(null);

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

      setUploadedImageUrl(data.filePath);
      setUploadDetails({
        size: data.fileSize,
        type: data.fileType,
      });
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
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
        </div>
        <button 
          type="submit" 
          disabled={uploading} 
          className={`w-full py-2 px-4 rounded-md text-white font-medium
                     ${uploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
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
          
          {uploadDetails && (
            <div className="mb-3 text-sm text-gray-600">
              <p>Size: {formatFileSize(uploadDetails.size)}</p>
              <p>Type: {uploadDetails.type || 'Unknown'}</p>
            </div>
          )}
          
          <div className="border rounded overflow-hidden">
            <img 
              src={uploadedImageUrl} 
              alt="Uploaded" 
              className="w-full h-auto" 
            />
          </div>
        </div>
      )}
    </div>
  );
}