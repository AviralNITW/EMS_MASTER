import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

export const DocumentUploader = ({ onUpload, isUploading, error, task, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUpload(files[0], setUploadProgress);
    }
  }, [onUpload, disabled, isUploading]);

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onUpload(files[0], setUploadProgress);
    }
  };

  // Create a ref for the file input
  const fileInputRef = React.useRef(null);
  
  // Handle click on the drop zone
  const handleClick = useCallback(() => {
    if (fileInputRef.current && !isUploading && !disabled) {
      fileInputRef.current.click();
    }
  }, [isUploading, disabled]);

  return (
    <div className="mt-4">
      <div
        className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        } ${(isUploading || disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          type="file"
          id="document-upload"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInput}
          disabled={isUploading || disabled}
        />
        
        <div className="text-center">
          <svg
            className={`mx-auto h-8 w-8 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          
          <div className="mt-2 text-sm text-gray-600">
            <label
              className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
            >
              <span>Click to upload a file</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
          </div>
          
          {(isUploading || disabled) && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      </div>
      
      {task?.submittedDocuments?.length > 0 && (
        <div className="mt-2">
          <h4 className="text-xs font-medium text-gray-700 mb-1">Uploaded Documents:</h4>
          <ul className="space-y-1">
            {task?.submittedDocuments?.map((doc, index) => (
              <li key={index} className="flex items-center text-xs text-gray-600">
                <svg
                  className="h-4 w-4 mr-1 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <a
                  href={`http://localhost:5000${doc.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                  title={doc.originalName}
                >
                  {doc.originalName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

DocumentUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
  error: PropTypes.string,
  task: PropTypes.shape({
    submittedDocuments: PropTypes.arrayOf(
      PropTypes.shape({
        fileName: PropTypes.string,
        originalName: PropTypes.string,
        filePath: PropTypes.string,
        fileSize: PropTypes.number,
        mimeType: PropTypes.string,
        uploadedAt: PropTypes.string
      })
    )
  })
};

export default DocumentUploader;
