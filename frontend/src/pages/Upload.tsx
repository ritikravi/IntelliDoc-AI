import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  id?: string;
}

export default function Upload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'uploading',
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Upload each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = files.length + i;
      try {
        const response = await apiService.uploadDocument(
          newFiles[i].file,
          (progress) => {
            setFiles((prev) => {
              const updated = [...prev];
              updated[fileIndex] = { ...updated[fileIndex], progress };
              return updated;
            });
          }
        );

        setFiles((prev) => {
          const updated = [...prev];
          updated[fileIndex] = {
            ...updated[fileIndex],
            status: 'processing',
            id: response.documentId,
          };
          return updated;
        });

        // Start processing
        await apiService.processDocument(response.documentId);

        setFiles((prev) => {
          const updated = [...prev];
          updated[fileIndex] = { ...updated[fileIndex], status: 'completed' };
          return updated;
        });

        toast.success(`${newFiles[i].file.name} processed successfully!`);
      } catch (error) {
        setFiles((prev) => {
          const updated = [...prev];
          updated[fileIndex] = { ...updated[fileIndex], status: 'error' };
          return updated;
        });
        toast.error(`Failed to process ${newFiles[i].file.name}`);
      }
    }
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Documents</h1>
        <p className="text-muted-foreground mt-1">
          Upload invoices, receipts, and financial documents for AI processing
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UploadIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, PNG, JPG, JPEG (Max 10MB)
          </p>
        </div>
      </motion.div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {files.map((uploadedFile, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center flex-1">
                  <File className="w-8 h-8 text-primary mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadedFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadedFile.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {uploadedFile.progress}%
                        </p>
                      </div>
                    )}
                    {uploadedFile.status === 'processing' && (
                      <p className="text-sm text-yellow-600 mt-1 flex items-center">
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Processing with AI...
                      </p>
                    )}
                    {uploadedFile.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </p>
                    )}
                    {uploadedFile.status === 'error' && (
                      <p className="text-sm text-red-600 mt-1">Failed to process</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
