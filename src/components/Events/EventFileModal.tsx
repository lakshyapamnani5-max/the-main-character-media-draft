import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { EventFile, EventFileCategory, EventShoot } from '../../types';

interface EventFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventShoot;
  onSaveFile: (file: Omit<EventFile, 'id' | 'eventId' | 'uploadedAt'>) => void;
}

export const EventFileModal: React.FC<EventFileModalProps> = ({
  isOpen,
  onClose,
  event,
  onSaveFile
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EventFileCategory>('Contract');
  const [fileType, setFileType] = useState('PDF Document');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [uploadedBy, setUploadedBy] = useState('Devansh Saxena');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveFile({
      name: name.trim(),
      category,
      fileType,
      fileSize,
      uploadedBy,
      notes: notes.trim()
    });

    onClose();
  };

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setName(file.name);
      setFileType(file.type || 'Document');
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E8E3D9] max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E3D9] pb-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C58B39]">Production Assets</div>
            <h2 className="font-serif text-lg font-bold text-[#181818]">Upload Production Asset</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* File Picker */}
          <div className="p-4 border-2 border-dashed border-[#DCD6C8] hover:border-[#C58B39] rounded text-center bg-[#FAF8F5] cursor-pointer relative">
            <Upload className="w-6 h-6 text-[#C58B39] mx-auto mb-1.5" />
            <span className="font-medium text-neutral-800 block">Click to select file or drag & drop</span>
            <span className="text-[10px] text-neutral-500">PDF, PNG, JPG, PSD, MP4 (up to 50MB)</span>
            <input
              type="file"
              onChange={handleSimulateFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">File Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Official_Signed_Contract_2026.pdf"
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded text-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">Asset Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventFileCategory)}
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded bg-white text-neutral-900"
              >
                <option value="Contract">Contract / Agreement</option>
                <option value="Moodboard">Moodboard / Visual Deck</option>
                <option value="Shot List">Shot List / Directives</option>
                <option value="Venue Map">Venue Map / Gate Pass</option>
                <option value="Reference Media">Reference Media</option>
                <option value="PDF">General PDF</option>
                <option value="Image">Image Reference</option>
                <option value="Other">Other Asset</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Uploaded By</label>
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="Devansh Saxena"
                className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">Asset Notes & Description</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Digitally signed by bride on 12 Jan 2026."
              className="w-full px-3 py-1.5 border border-[#DCD6C8] rounded"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E8E3D9] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#181818] hover:bg-[#282828] text-white font-medium rounded transition-colors"
            >
              Attach File
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
