import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Plus, Calendar, X, Send } from 'lucide-react';
import SkeletonLoader from '../UI/SkeletonLoader';
import { announcementAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AnnouncementsView = ({ role }) => {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'All',
    type: 'Info'
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementAPI.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await announcementAPI.create(formData);
      toast.success('Announcement posted successfully');
      setShowForm(false);
      setFormData({ title: '', content: '', targetRole: 'All', type: 'Info' });
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || 'Failed to post announcement');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await announcementAPI.delete(id);
      toast.success('Announcement deleted');
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Alert': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Event': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Update': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Company Announcements</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stay updated with the latest news, events, and alerts.</p>
        </div>
        
        {(role === 'Admin' || role === 'HR' || role === 'Manager') && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />} 
            {showForm ? 'Cancel' : 'Post Announcement'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handlePost} className="bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2"><Megaphone size={16} className="text-primary"/> New Announcement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors" placeholder="Announcement Title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                  <option value="Info" className="bg-gray-900 text-gray-900 dark:text-white">Info</option>
                  <option value="Event" className="bg-gray-900 text-gray-900 dark:text-white">Event</option>
                  <option value="Update" className="bg-gray-900 text-gray-900 dark:text-white">Update</option>
                  <option value="Alert" className="bg-gray-900 text-gray-900 dark:text-white">Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Target Audience</label>
                <select value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none">
                  <option value="All" className="bg-gray-900 text-gray-900 dark:text-white">All Roles</option>
                  <option value="Employee" className="bg-gray-900 text-gray-900 dark:text-white">Employees</option>
                  <option value="Manager" className="bg-gray-900 text-gray-900 dark:text-white">Managers</option>
                  <option value="HR" className="bg-gray-900 text-gray-900 dark:text-white">HR</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Content</label>
            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-colors resize-none h-24" placeholder="Write the announcement details here..."></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              <Send size={16} /> Post
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-2xl flex flex-col overflow-hidden">
        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {announcements.map((ann) => (
              <div key={ann._id} className="bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl p-5 hover:bg-white/[0.04] transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(ann.type).split(' ')[0]} bg-opacity-20`}>
                      <Megaphone size={18} className={getTypeColor(ann.type).split(' ')[1]} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{ann.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-500">{ann.author?.firstName} {ann.author?.lastName}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Calendar size={10} /> {new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                        {ann.targetRole !== 'All' && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">For: {ann.targetRole}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getTypeColor(ann.type)}`}>
                      {ann.type}
                    </span>
                    {(role === 'Admin' || role === 'HR') && (
                      <button onClick={() => handleDelete(ann._id)} className="text-gray-500 hover:text-red-500 transition-colors p-1" title="Delete">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pl-11 whitespace-pre-wrap">
                  {ann.content}
                </p>
              </div>
            ))}
            
            {announcements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <Bell size={32} className="mb-3 opacity-50" />
                <p>No announcements yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsView;
