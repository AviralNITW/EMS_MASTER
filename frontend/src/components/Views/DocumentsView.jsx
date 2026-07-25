import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Eye, File, Trash2, Folder, X, Send } from 'lucide-react';
import SkeletonLoader from '../UI/SkeletonLoader';
import { documentAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DocumentsView = ({ role }) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fileUrl: '',
    category: 'Policy'
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentAPI.getAll();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await documentAPI.create(formData);
      toast.success('Document uploaded successfully');
      setShowUpload(false);
      setFormData({ title: '', fileUrl: '', category: 'Policy' });
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || 'Failed to upload document');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentAPI.delete(id);
      toast.success('Document deleted');
      setDocuments(documents.filter(d => d._id !== id));
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIconColor = (category) => {
    switch(category) {
      case 'Policy': return 'text-purple-400 bg-purple-400/10';
      case 'Report': return 'text-emerald-400 bg-emerald-400/10';
      case 'Benefit': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-500 dark:text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Center</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Access company policies, reports, and your personal documents.</p>
        </div>
        
        {(role === 'Admin' || role === 'HR') && (
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
          >
            {showUpload ? <X size={16} /> : <Upload size={16} />}
            {showUpload ? 'Cancel' : 'Upload Document'}
          </button>
        )}
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2"><Upload size={16} className="text-primary"/> Upload Document (URL link)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="e.g. Employee Handbook" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">File URL</label>
              <input type="url" required value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="https://example.com/file.pdf" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                <option value="Policy" className="bg-gray-900 text-gray-900 dark:text-white">Policy</option>
                <option value="Contract" className="bg-gray-900 text-gray-900 dark:text-white">Contract</option>
                <option value="Training" className="bg-gray-900 text-gray-900 dark:text-white">Training</option>
                <option value="Identity" className="bg-gray-900 text-gray-900 dark:text-white">Identity</option>
                <option value="Other" className="bg-gray-900 text-gray-900 dark:text-white">Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              <Send size={16} /> Save Document Link
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col overflow-hidden">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonLoader type="card" count={4} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* Quick Folders */}
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {['Company Policies', 'Benefits & Health', 'My Documents', 'Tax Forms'].map((cat, i) => (
                <div key={i} className="bg-white/[0.02] border border-gray-200 dark:border-white/5 p-4 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Folder size={20} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{cat}</span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Recent Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${getFileIconColor(doc.category).split(' ')[1]}`}>
                      <FileText size={24} className={getFileIconColor(doc.category).split(' ')[0]} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{doc.category}</span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-200 group-hover:text-primary transition-colors truncate" title={doc.title}>{doc.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Uploaded by {doc.uploadedBy?.firstName}</p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg" title="Open Link">
                        <Eye size={14} />
                      </a>
                      {(role === 'Admin' || role === 'HR') && (
                        <button onClick={() => handleDelete(doc._id)} className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {documents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <File size={32} className="mb-3 opacity-50" />
                <p>No documents found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
