import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link'; // Added Link for navigation
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import ReviewForm from '../components/ReviewForm'; // Keep using the form component
import StarRating from '../components/StarRating'; // Keep using the star component
import { 
  MessageSquare, CheckCircle, Search, Filter, 
  MapPin, Phone, Mail, ChevronDown, Menu, X, Star, AlertTriangle, XCircle, ArrowUp
} from 'lucide-react';

// ... imports are up here ...

// --- COMPONENT: 3D TILT CARD (NEW) ---
const TiltCard = ({ children, className }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // ⬇️ PASTE THE CODE RIGHT HERE ⬇️
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate mouse position relative to the center of the card
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Calculate rotation (max 10 degrees)
    const rotateY = (mouseX / (width / 2)) * 5; 
    const rotateX = (mouseY / (height / 2)) * -5;

    setRotation({ x: rotateX, y: rotateY });
  };
  // ⬆️ END OF PASTED CODE ⬆️

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 }); // Reset position
  };

  return (
    <div 
      className="perspective-1000" 
      style={{ perspective: '1000px' }} // This gives the 3D depth
    >
      <div
        ref={cardRef}
        onMouseMove={(e) => { setIsHovered(true); handleMouseMove(e); }}
        onMouseLeave={handleMouseLeave}
        className={`${className} transition-transform duration-100 ease-out will-change-transform`}
        style={{
          // Apply the calculated rotation
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Render whatever content is passed inside <TiltCard>...</TiltCard> */}
        {children}
        
        {/* The Glossy Glare Effect Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.15 : 0,
            background: `linear-gradient(${135 + rotation.y * 5}deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 60%)`,
            borderRadius: 'inherit'
          }}
        />
      </div>
    </div>
  );
};

// --- COMPONENT: SCROLL TO TOP ---
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-[#DC2626] text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-110 active:scale-95 border-2 border-white"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
};

// --- NEW COMPONENT: WARNING MODAL (MOBILE OPTIMIZED) ---
const WarningModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 12000); // Auto close after 12 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm transition-opacity">
      {/* Added max-h-[90vh] and overflow-y-auto for small screens */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[4px] md:border-[6px] border-[#FFCC01] shadow-2xl rounded-lg animate-in fade-in zoom-in duration-300 scrollbar-hide">
        
        {/* Close Button - Larger touch target for mobile */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors z-20 bg-white rounded-full shadow-sm"
        >
          <XCircle size={28} className="md:w-8 md:h-8" />
        </button>

        <div className="p-5 md:p-8 text-center">
          {/* Header */}
          <div className="bg-[#222] inline-block px-6 py-2 mb-4 md:mb-6 shadow-md transform -skew-x-12 mt-2">
            <h2 className="text-2xl md:text-4xl font-black text-[#DC2626] tracking-widest uppercase transform skew-x-12">
              CAUTION
            </h2>
          </div>

          {/* Main Content */}
          <div className="space-y-4 md:space-y-6 text-gray-800">
            <p className="text-base md:text-lg font-medium leading-relaxed">
              It has come to our notice that few shady logistics companies are operating with names similar to <span className="font-bold">VRL Logistics Packers and Movers</span>.
            </p>
            
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm md:text-base">
              <p className="text-gray-600 italic">
                Example: "VRL Packers and Movers", "VRL Movers and Packers", "VRL Movers", "VRL Shipping", etc.
              </p>
            </div>

            <p className="text-sm md:text-base leading-relaxed">
              Please note that <strong>VRL Logistics Packers and Movers</strong> is <span className="text-red-600 font-bold underline">NOT connected</span> to these entities. Genuine reviews for our official services are listed only on this portal.
            </p>

            {/* Advance Payment Alert Section */}
            <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t-2 border-dashed border-gray-300">
              <h3 className="text-lg md:text-xl font-bold text-[#DC2626] mb-2 flex items-center justify-center gap-2">
                <AlertTriangle className="fill-red-100 w-5 h-5 md:w-6 md:h-6" /> 
                Advance Payment Alert!
              </h3>
              <p className="text-xs md:text-sm text-gray-700 mb-2">
                Our authorized executives will <strong>NEVER</strong> request advance payments via personal accounts. Payments are only required after official consignment booking.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FFCC01] p-2 md:p-3 text-center sticky bottom-0 z-10">
          <p className="text-[#DC2626] font-bold text-xs md:text-sm">
            This message will disappear in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  // --- STATE ---
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // NEW: State for Warning Modal (Defaults to true to show on load)
  const [isWarningOpen, setIsWarningOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New State for Functionality
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() 
        }));
        setReviews(liveData);
        setLoading(false);
      }, (err) => {
        console.error("Database Error:", err);
        setLoading(false);
        if (err.code === 'permission-denied') {
          setError("Database permission denied. Did you set Firestore Rules to true?");
        } else {
          setError("Failed to load reviews. Check console.");
        }
      });
      return () => unsubscribe();
    } catch (err) {
      setError("Error setting up connection.");
    }
  }, []);

  // --- NEW: Function to handle Home navigation without reload ---
  const handleHomeClick = (e) => { // <--- NEW FUNCTION
    e.preventDefault(); // Stop page reload
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Just scroll up
  };

  // --- ADVANCED LOGIC ---
  
  // 1. Filter & Sort Logic
  const processedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter
    if (filterCategory !== 'All') {
      result = result.filter(r => r.serviceType === filterCategory);
    }

    // Sort
    if (sortBy === 'Lowest') {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'Highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Default Newest (already sorted by DB, but good to ensure)
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [reviews, filterCategory, sortBy]);

  // 2. Stats Calculation
  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total ? (sum / total).toFixed(1) : 0;
    
    // Count per star (5, 4, 3, 2, 1)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (distribution[r.rating] !== undefined) distribution[r.rating]++;
    });

    return { total, avg, distribution };
  }, [reviews]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">

      {/* --- ADDED: WARNING MODAL --- */}
      <WarningModal 
        isOpen={isWarningOpen} 
        onClose={() => setIsWarningOpen(false)} 
      />

      {/* --- NEW: SCROLL TO TOP BUTTON --- */}
      <ScrollToTop />
      
      {/* --- 1. PROFESSIONAL NAVBAR (VRL BRANDED) --- */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-t-4 border-[#FFCC01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo Section */}
            {/* Logo Section - Custom Image */}
<div className="flex items-center flex-shrink-0" onClick={handleHomeClick}>
  
  <Link href="/">
  <img 
    src="/vrl-logo.png"  // Make sure this matches your file name in the public folder
    alt="VRL Logistics Packers and Movers" 
    className="h-35 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity" // h-14 sets the height; w-auto keeps aspect ratio
  />
</Link>
</div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#contact-section" className="text-gray-600 hover:text-[#DC2626] font-medium transition">Contact</a>
              <a href="https://vrllogistics.co.in/services" className="text-gray-600 hover:text-[#DC2626] font-medium transition">Services</a>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#DC2626] hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-red-100 transition-all transform hover:-translate-y-0.5"
              >
                Write a Review
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-2 hover:text-[#DC2626]">
                {isMobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
           <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-[#FFCC01] p-4 space-y-4 shadow-xl z-40 transition-all duration-300 ease-in-out">
             <a 
               href="#contact-section" 
               onClick={() => setIsMobileMenuOpen(false)} // <--- CHANGED: Added to close menu
               className="block px-4 py-2 text-gray-700 hover:bg-[#FFF8E1] rounded-lg font-medium"
             >
               Contact
             </a>
             <a 
               href="https://vrllogistics.co.in/services" 
               onClick={() => setIsMobileMenuOpen(false)} // <--- CHANGED: Added to close menu
               className="block px-4 py-2 text-gray-700 hover:bg-[#FFF8E1] hover:text-[#DC2626] rounded-lg font-medium border-l-4 border-transparent hover:border-[#FFCC01] transition-all"
             >
               Services
             </a>
             <button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#DC2626] text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition-transform"
              >
                Write a Review
              </button>
           </div>
        )}
      </nav>

      {/* --- 2. MODERN HERO SECTION --- */}
      <div className="relative bg-[#111] text-white overflow-hidden">
        {/* Abstract Background Elements (Brand Colors) */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FFCC01] opacity-10 skew-x-12 transform translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#DC2626] opacity-10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 lg:py-24 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0 z-10 text-center md:text-left">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-[#FFCC01]/30 rounded-full px-4 py-1 mb-6">
               <span className="text-[#FFCC01] font-bold text-sm">★ India's No.1 Logistics Partner</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Trust delivered <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC01] to-yellow-200">
                Across India
              </span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg leading-relaxed mx-auto md:mx-0">
              Read genuine stories from thousands of customers who moved their homes, cars, and bikes with VRL.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button onClick={() => setIsModalOpen(true)} className="bg-[#FFCC01] text-black px-8 py-3.5 rounded-lg font-bold hover:bg-yellow-400 transition shadow-[0_0_20px_rgba(255,204,1,0.3)] active:scale-95 border border-[#FFCC01]">
                Share Feedback
              </button>
              <button className="px-8 py-3.5 rounded-lg font-bold text-white border border-gray-600 hover:bg-white/5 hover:border-[#FFCC01] hover:text-[#FFCC01] transition active:scale-95">
                View Services
              </button>
            </div>
          </div>

          {/* Stats Card (Floating) */}
          <div className="md:w-1/3 w-full relative z-10">
             <div className="bg-white/5 backdrop-blur-lg border border-[#FFCC01]/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFCC01] blur-2xl opacity-20"></div>
                <div className="flex items-end gap-3 mb-2">
                   <span className="text-6xl font-bold text-white">{stats.avg}</span>
                   <span className="text-xl text-gray-400 mb-2">/ 5</span>
                </div>
                <div className="mb-6">
                   <StarRating rating={Math.round(stats.avg)} size={6} />
                   <p className="text-sm text-gray-400 mt-2">{stats.total} Verified Reviews</p>
                </div>
                
                {/* Progress Bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-3 text-gray-400 font-medium">{star}</span>
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${star >= 4 ? 'bg-[#FFCC01]' : 'bg-gray-500'}`}
                          style={{ width: `${stats.total ? (stats.distribution[star] / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 -mt-10 relative z-20">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 mb-8 rounded-r-lg shadow-sm">
            <p className="text-[#DC2626] font-medium">{error}</p>
          </div>
        )}

        {/* --- 3. FILTER & SORT BAR --- */}
        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-[#FFCC01] mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
           {/* Categories */}
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {['All', 'Household', 'Car Transport', 'Bike Transport', 'Warehousing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    filterCategory === cat 
                      ? 'bg-[#DC2626] text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-[#FFF8E1] hover:text-[#DC2626]'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>

           {/* Sort Dropdown */}
           <div className="flex items-center gap-3 w-full md:w-auto">
             <span className="text-sm text-gray-500 font-medium">Sort by:</span>
             <div className="relative">
               <select 
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC01] font-medium cursor-pointer"
               >
                 <option value="Newest">Newest First</option>
                 <option value="Highest">Highest Rated</option>
                 <option value="Lowest">Lowest Rated</option>
               </select>
               <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
             </div>
           </div>
        </div>

        {/* --- 4. REVIEWS GRID --- */}
        {loading ? (
          <div className="text-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FFCC01] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Fetching trusted reviews...</p>
          </div>
        ) : processedReviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-[#FFF8E1] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-[#FFCC01]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {filterCategory === 'All' 
                ? "Be the first to share your experience with VRL Logistics." 
                : `No reviews yet for ${filterCategory}.`}
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#DC2626] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-red-700 transition"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processedReviews.map((review) => (
              <TiltCard key={review.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFCC01] to-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg border-2 border-white shadow-sm group-hover:border-[#FFCC01] transition-colors">
                      {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight group-hover:text-[#DC2626] transition-colors">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50">
                          {review.serviceType}
                        </span>
                        {review.verified && (
                          <span className="text-green-700 flex items-center gap-0.5 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={review.rating} size={4} />
                </div>
                
                {/* Comment */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[60px]">
                  "{review.comment}"
                </p>
                
                {/* Review Footer */}
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>PNR: {review.pnr}</span>
                  <span>{review.createdAt ? review.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </main>

      {/* --- ADDED: CONTACT INFORMATION SECTION --- */}
      <section id="contact-section" className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
             <p className="text-gray-500 max-w-xl mx-auto">We are here to help you. Reach out to us via any of the following channels.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Address Card */}
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#FFCC01] group">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
                  <MapPin size={32} />
               </div>
               <h3 className="font-bold text-lg text-gray-900 mb-2">Corporate Office</h3>
               <p className="text-gray-600 leading-relaxed text-sm">
                 35, 2nd cross, Hsr Layout, 8th sector,<br/>
                 Bommanahalli, Bengaluru - 560 068, Karnataka
               </p>
            </div>

            {/* Email Card */}
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#FFCC01] group">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
                  <Mail size={32} />
               </div>
               <h3 className="font-bold text-lg text-gray-900 mb-2">Email Us</h3>
               <p className="text-gray-600 leading-relaxed text-sm">
                 <a href="mailto:info@vrllogistics.co.in" className="hover:text-[#DC2626] transition-colors">info@vrllogistics.co.in</a>
               </p>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300 border border-transparent hover:border-[#FFCC01] group">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-[#DC2626] group-hover:bg-[#DC2626] group-hover:text-white transition-colors">
                  <Phone size={32} />
               </div>
               <h3 className="font-bold text-lg text-gray-900 mb-2">Call Us</h3>
               <p className="text-gray-600 leading-relaxed text-sm">
                 <a href="tel:+917338795585" className="block hover:text-[#DC2626] transition-colors">+91 7338795585 (Branch Office)</a>
                 <a href="tel:+919344147584" className="block hover:text-[#DC2626] transition-colors">+91 9344147584 (Customer Support)</a>
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. FOOTER (BRANDED) --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-[#FFCC01]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
           <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
  <img 
    src="/vrl-logo.png" 
    alt="VRL Logistics Packers and Movers" 
    className="h-42 w-auto object-contain brightness-0 invert" // 'brightness-0 invert' makes a black logo white for dark footers
  />
</div>
              <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
                VRL Logistics Packers and Movers is a well-established logistics company in India, known for its reliable and efficient services.
                The company's loading services are a key part of its comprehensive logistics solutions.
              </p>
              {/* <div className="flex gap-4">
                <span className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFCC01] hover:text-black transition cursor-pointer"><Phone size={18}/></span>
                <span className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFCC01] hover:text-black transition cursor-pointer"><Mail size={18}/></span>
                <span className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FFCC01] hover:text-black transition cursor-pointer"><MapPin size={18}/></span>
              </div> */}
           </div>
           
           <div>
             <h3 className="font-bold text-lg mb-4 text-[#FFCC01]">Quick Links</h3>
             <ul className="space-y-3 text-gray-400">
              <li>
                 <a 
                    href="#" 
                    onClick={handleHomeClick} // <--- NEW LINK
                    className="hover:text-white transition hover:underline"
                 >
                    Home
                 </a>
               </li>
               <li><a href="https://vrllogistics.co.in/gallery" className="hover:text-white transition hover:underline">Gallery</a></li>              
               <li><a href="#contact-section" className="hover:text-white transition hover:underline">Contact</a></li>
             </ul>
           </div>

           <div>
             <h3 className="font-bold text-lg mb-4 text-[#FFCC01]">Services</h3>
             <ul className="space-y-3 text-gray-400">
               <li><a href="https://vrllogistics.co.in/home-relocation.php" className="hover:text-white transition hover:underline">Home Relocation</a></li>
               <li><a href="https://vrllogistics.co.in/car-transportation.php" className="hover:text-white transition hover:underline">Car Transportation</a></li>
               <li><a href="https://vrllogistics.co.in/bike-transportation.php" className="hover:text-white transition hover:underline">Bike Transportation</a></li>
             </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
           © 2025 VRL Logistics Packers and Movers. All rights reserved.
        </div>
      </footer>

      {/* Review Modal */}
      <ReviewForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={user?.uid}
      />
    </div>
  );
}
