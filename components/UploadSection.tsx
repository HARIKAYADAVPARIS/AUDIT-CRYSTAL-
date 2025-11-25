import React, { useState, useCallback } from 'react';
import { FileData } from '../types';

interface UploadSectionProps {
  onAnalyze: (file: FileData | null, text: string) => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<FileData | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract Base64 part
      const base64 = result.split(',')[1];
      setFile({
        name: selectedFile.name,
        mimeType: selectedFile.type,
        base64: base64
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file && !textInput) return;
    onAnalyze(file, textInput);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-audit-600 to-sustain-500">Crystal</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Instant CSRD readiness check. Upload your sustainability report, PDF, or paste text to detect gaps against ESRS standards.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-audit-900/5 overflow-hidden border border-slate-100">
        <div className="p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-slate-100">
            {/* File Upload Area */}
            <div 
              className={`relative p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 ${dragActive ? 'bg-audit-50' : 'bg-white hover:bg-slate-50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept=".pdf,.txt,.md,.csv" 
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isAnalyzing}
              />
              <div className="w-16 h-16 bg-audit-100 text-audit-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              {file ? (
                <div className="space-y-2">
                  <p className="font-semibold text-audit-800">{file.name}</p>
                  <button 
                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium z-20 relative"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium text-slate-900">Drop PDF or Click to Upload</p>
                  <p className="text-sm text-slate-500 mt-1">Supports PDF, TXT, MD</p>
                </>
              )}
            </div>

            {/* Text / URL Area */}
            <div className="p-8 flex flex-col">
              <label className="text-sm font-semibold text-slate-700 mb-2">
                Or paste text / URL content
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your sustainability statement or report content here..."
                className="flex-1 w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-audit-500 focus:border-audit-500 resize-none text-slate-700 bg-slate-50 text-sm"
                rows={6}
                disabled={isAnalyzing}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={(!file && !textInput) || isAnalyzing}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white transition-all
              ${(!file && !textInput) || isAnalyzing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-audit-600 hover:bg-audit-700 shadow-lg shadow-audit-600/20 active:scale-95'}
            `}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Generate Analysis</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;