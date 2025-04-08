"use client"
import { useState } from 'react';

import ImageGallery from "@/components/ImageGallery";
import ImageUploadForm from "@/components/ImageUploadForm";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Force the gallery to refresh by updating the key
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
      <div className="min-h-screen bg-gray-100 py-12">
        <main className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Picky Image Uploader
          </h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            {/* Since ImageUploadForm uses client-side state, we need to use client directive */}
            <ImageUploadForm onUploadSuccess={handleUploadSuccess}/>
          </div>
          
          <div className="mt-8 text-center text-gray-600">
            <p>
              Upload your images and they will be stored in the <code className="bg-gray-200 px-1 rounded">public/uploads</code> directory.
            </p>
          </div>

          <ImageGallery key={refreshKey} />

        </main>
      </div>
    );
}
