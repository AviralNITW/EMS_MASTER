import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Policy', 'Report', 'Benefit', 'Contract', 'Training', 'Identity', 'Other'],
    default: 'Policy'
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
