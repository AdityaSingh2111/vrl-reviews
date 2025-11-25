import { useState } from 'react';
import { db } from '../lib/firebase'; // Import our database connection
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import StarRating from './StarRating';

export default function ReviewForm({ isOpen, onClose, userId }) {
  // State: This holds the data the user types in real-time
  const [formData, setFormData] = useState({
    name: '',
    pnr: '',
    serviceType: 'Household',
    rating: 0,
    comment: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If the modal is closed, don't render anything
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page refresh
    setError('');

    // VALIDATION LOGIC
    if (formData.rating === 0) {
      setError('Please give a star rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      // --- BACKEND LOGIC ---
      // 1. Point to the 'reviews' collection in our database
      const reviewsRef = collection(db, 'reviews');
      
      // 2. Add the document
      await addDoc(reviewsRef, {
        ...formData, // Spread all form fields
        userId: userId || 'anonymous',
        createdAt: serverTimestamp(), // Let the server decide the time (more accurate)
        verified: Math.random() > 0.3 // Simulating a backend check if PNR is real
      });
      
      // 3. Reset form and close
      setFormData({ name: '', pnr: '', serviceType: 'Household', rating: 0, comment: '' });
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError('Failed to submit. Check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark background overlay */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-lg overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle">
          
          {/* Form Header */}
          <div className="bg-[#FFCC01] px-4 py-3 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Share your Experience</h3>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          
          {/* Actual Form Inputs */}
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                required 
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 border"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Consignment No. (PNR)</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. VRL88291"
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 border"
                value={formData.pnr}
                onChange={(e) => setFormData({...formData, pnr: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Service Used</label>
              <select 
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 border"
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
               <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
               <div className="bg-gray-50 p-3 rounded-lg border flex justify-center">
                 <StarRating rating={formData.rating} setRating={(r) => setFormData({...formData, rating: r})} interactive={true} size={8} />
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Review</label>
              <textarea 
                rows={3}
                required
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2 border"
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}