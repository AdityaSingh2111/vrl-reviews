import { Plus } from 'lucide-react';

export default function Header({ onOpenReviewModal }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* --- VRL BRANDING AREA --- */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              {/* The VRL Yellow Box Logo */}
              <div className="w-12 h-12 bg-[#FFCC01] rounded-lg flex items-center justify-center text-red-700 font-black text-xl shadow-sm">
                VRL
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">VRL Logistics</h1>
                <span className="text-xs text-red-600 font-semibold tracking-wider uppercase">Packers & Movers</span>
              </div>
            </div>
          </div>
          
          {/* --- NAVIGATION BUTTONS --- */}
          <div className="flex items-center space-x-4">
            {/* The "Write Review" button */}
            <button 
              onClick={onOpenReviewModal}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-medium shadow-md transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Write a Review</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}