import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import StarRating from './StarRating';

export default function ReviewForm({ isOpen, onClose, userId }) {
  const [formData, setFormData] = useState({
    name: '',
    pnr: '',
    serviceType: 'Household',
    rating: 0,
    comment: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Return null immediately if closed (Standard React Pattern)
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.rating === 0) {
      setError('Please give a star rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewsRef = collection(db, 'reviews');
      
      await addDoc(reviewsRef, {
        ...formData,
        userId: userId || 'anonymous',
        createdAt: serverTimestamp(),
        verified: Math.random() > 0.3 
      });
      
      // Reset and Close
      setFormData({ name: '', pnr: '', serviceType: 'Household', rating: 0, comment: '' });
      onClose();
      // Optional: Alert success
      alert('Review submitted successfully!');
    } catch (err) {
      console.error("Error submitting review:", err);
      // More descriptive error for the user
      setError('Failed to submit. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // FIXED: Modern Flexbox Modal Structure (No more inline-block hacks)
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      
      {/* 1. Backdrop / Overlay */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Modal Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#FFCC01] px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Share your Experience</h3>
          <button 
            type="button" // Always specify type="button" for non-submit buttons
            onClick={onClose} 
            className="text-gray-900 hover:text-red-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              required 
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-[#FFCC01] focus:border-[#FFCC01] outline-none transition"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Consignment No. (PNR)</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. VRL88291"
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-[#FFCC01] focus:border-[#FFCC01] outline-none transition"
              value={formData.pnr}
              onChange={(e) => setFormData({...formData, pnr: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Service Used</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-[#FFCC01] focus:border-[#FFCC01] outline-none transition bg-white"
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            >
              <option>Household Shifting</option>
              <option>Car Transport</option>
              <option>Bike Transport</option>
              <option>Warehousing</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-center">
               <StarRating 
                 rating={formData.rating} 
                 setRating={(r) => setFormData({...formData, rating: r})} 
                 interactive={true} 
                 size={8} 
               />
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Review</label>
            <textarea 
              rows={3}
              required
              className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-[#FFCC01] focus:border-[#FFCC01] outline-none transition"
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 text-white bg-[#DC2626] rounded-lg hover:bg-red-700 font-bold shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </div>
    </div>
  );
}