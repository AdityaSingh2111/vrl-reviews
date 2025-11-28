import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { db, auth, googleProvider, facebookProvider } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import {
  signInAnonymously, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut
} from 'firebase/auth';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import {
  MessageSquare, CheckCircle, ChevronDown, Menu, X,
  MapPin, Phone, Mail, AlertTriangle, XCircle, ArrowUp, Quote, Reply, LogIn, LogOut, User, Calendar, Clock
} from 'lucide-react';

// --- COMPONENT: 3D TILT CARD ---
const TiltCard = ({ children, className }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rotateY = (mouseX / (width / 2)) * 5;
    const rotateX = (mouseY / (height / 2)) * -5;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div className="perspective-1000" style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        onMouseMove={(e) => { setIsHovered(true); handleMouseMove(e); }}
        onMouseLeave={handleMouseLeave}
        className={`${className} transition-transform duration-100 ease-out will-change-transform`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
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
    const toggleVisibility = () => window.pageYOffset > 300 ? setIsVisible(true) : setIsVisible(false);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return isVisible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 bg-[#DC2626] text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-110 active:scale-95 border-2 border-white"
    >
      <ArrowUp size={24} />
    </button>
  ) : null;
};

// --- COMPONENT: WARNING MODAL ---
const WarningModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[4px] md:border-[6px] border-[#FFCC01] shadow-2xl rounded-lg animate-in fade-in zoom-in duration-300 no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition-colors z-20 bg-white rounded-full shadow-sm"
        >
          <XCircle size={28} />
        </button>
        <div className="p-5 md:p-8 text-center">
          <div className="bg-[#222] inline-block px-6 py-2 mb-4 md:mb-6 shadow-md transform -skew-x-12 mt-2">
            <h2 className="text-2xl md:text-4xl font-black text-[#DC2626] tracking-widest uppercase transform skew-x-12">
              CAUTION
            </h2>
          </div>
          <div className="space-y-4 md:space-y-6 text-gray-800">
            <p className="text-base md:text-lg font-medium">
              It has come to our notice that few shady logistics companies are operating with names similar to <span className="font-bold">VRL Logistics Packers and Movers</span>.
            </p>
            <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm md:text-base italic text-gray-600">
              Example: "VRL Packers and Movers", "VRL Shipping", "VRL Logistics Movers and Packers" etc.
            </div>
            <p className="text-sm md:text-base">
              Please note that <strong>VRL Logistics Packers and Movers</strong> is <span className="text-red-600 font-bold underline">NOT connected</span> to these entities.
            </p>
            <div className="mt-4 pt-4 md:mt-6 md:pt-6 border-t-2 border-dashed border-gray-300">
              <h3 className="text-lg md:text-xl font-bold text-[#DC2626] mb-2 flex items-center justify-center gap-2">
                <AlertTriangle className="fill-red-100 w-5 h-5 md:w-6 md:h-6" />
                Advance Payment Alert!
              </h3>
              <p className="text-xs md:text-sm text-gray-700">
                Our authorized executives will <strong>NEVER</strong> request advance payments via personal/saving accounts.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#FFCC01] p-2 md:p-3 text-center sticky bottom-0 z-10">
          <p className="text-[#DC2626] font-bold text-xs md:text-sm">This message will disappear shortly...</p>
        </div>
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onGoogleLogin, onFacebookLogin, onGuestLogin }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#FFCC01] p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to VRL Reviews</h2>
          <p className="text-gray-800 text-sm mt-1 font-medium">Please login to continue</p>
        </div>

        <div className="p-8 space-y-3">
          {/* Google Login Button */}
          <button
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 p-3 rounded-xl hover:bg-gray-50 hover:border-[#4285F4] transition-all group"
          >
            <div className="w-6 h-6">
              {/* Simple Google G Icon SVG */}
              <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            </div>
            <span className="font-bold text-gray-700 group-hover:text-[#4285F4]">Login with Google</span>
          </button>
          {/* Facebook Login Button */}
          <button
            onClick={onFacebookLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 p-3 rounded-xl hover:bg-gray-50 hover:border-[#1877F2] transition-all group"
          >
            <div className="w-6 h-6">
              {/* Facebook Logo SVG */}
              <svg viewBox="0 0 24 24" className="w-full h-full fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </div>
            <span className="font-bold text-gray-700 group-hover:text-[#1877F2]">Login with Facebook</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Guest Login Button */}
          <button
            onClick={onGuestLogin}
            className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 hover:text-gray-700 transition-colors text-sm"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
// --- PROFILE MODAL COMPONENT ---
const ProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Profile Header */}
        <div className="h-32 bg-gradient-to-r from-[#FFCC01] to-yellow-400 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all z-20"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-gray-300" />
              )}
            </div>
            {/* Verified Badge */}
            {user.email && (
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-[3px] shadow-sm" title="Verified User">
                <img
                  src="/blue-tick.png"
                  alt="Verified"
                  className="w-6 h-6 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 pt-20">

          {/* User Info - No more margin-top needed */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{user.displayName || 'Guest User'}</h2>
            <p className="text-sm text-gray-500 font-medium">{user.email || 'No email linked'}</p>
          </div>

          {/* Stats / Details Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Calendar size={18} />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Joined</p>
                <p className="text-xs font-bold text-gray-700">
                  {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recent'}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <Clock size={18} />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Last Seen</p>
                <p className="text-xs font-bold text-gray-700">
                  {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Now'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-8">
            <button
              onClick={() => { onClose(); onLogout(); }}
              className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-red-200"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  // --- STATE VARIABLES ---
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false); // true to false
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentVerifiedIndex, setCurrentVerifiedIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const handleCloseWarning = useCallback(() => {
    setIsWarningOpen(false);
  }, []);
  // --- AUTH ---
  useEffect(() => {
    if (!auth) return;

    // 1. Check if user just returned from Facebook Redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User successfully logged in via Redirect
          //console.log("Redirect Login Success:", result.user);
          console.log("Redirect Login Success:", result.user);
          // Modal will close automatically via the onAuthStateChanged listener below
        }
      })
      .catch((error) => {
        console.error("Redirect Login Error:", error);
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/user-cancelled') {
          alert(`Login Failed: ${error.message}`);
        }
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setIsAuthChecking(false);

      if (u) {
        setUser(u);
        setShowLoginModal(false);
        setIsWarningOpen(true);
      } else {
        setUser(null);
        setShowLoginModal(true);
        setIsWarningOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Login Handlers ---
  const handleGoogleLogin = async () => {
    try {
      // Google usually works fine with Popup on all devices
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Login Error:", err);
      // Fallback to redirect if popup fails (optional but recommended)
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        alert("Failed to login with Google.");
      }
    }
  };
  // --- Facebook Login Handler ---
  const handleFacebookLogin = async () => {
    try { await signInWithPopup(auth, facebookProvider); }
    catch (err) { console.error(err); alert("Facebook Login Failed"); }
  };
  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      // Modal closes automatically
    } catch (err) {
      console.error("Guest Login Error:", err);
    }
  };
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      setIsProfileOpen(false);

    }
  };
  // Data Fetching
  useEffect(() => {
    if (!db) {
      setError("Database not initialized. Check API keys.");
      setLoading(false);
      return;
    }
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
        console.error("Firestore Error:", err);
        setLoading(false);
        setError("Unable to load reviews. Please try again later.");
      });
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setError("Connection failed.");
      setLoading(false);
    }
  }, []);
  //Logic for Verified Review Carousel (Every 5 Seconds)
  const verifiedReviews = useMemo(() => reviews.filter(r => r.verified), [reviews]);

  useEffect(() => {
    if (verifiedReviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentVerifiedIndex((prev) => (prev + 1) % verifiedReviews.length);
    }, 5000); // 5000ms = 5 seconds
    return () => clearInterval(interval);
  }, [verifiedReviews.length]);
  // Filter & Sort
  const processedReviews = useMemo(() => {
    let result = [...reviews];
    if (filterCategory !== 'All') result = result.filter(r => r.serviceType === filterCategory);
    if (showVerifiedOnly) result = result.filter(r => r.verified);
    if (sortBy === 'Lowest') result.sort((a, b) => a.rating - b.rating);
    else if (sortBy === 'Highest') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => b.createdAt - a.createdAt);
    return result;
  }, [reviews, filterCategory, sortBy, showVerifiedOnly]);
  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const verifiedTotal = reviews.filter(r => r.verified).length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total ? (sum / total).toFixed(1) : 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (distribution[r.rating] !== undefined) distribution[r.rating]++; });
    return { total, verifiedTotal, avg, distribution };
  }, [reviews]);
  // --- GLOBAL LOADING STATE ---
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="flex flex-col items-center gap-4">
  //         <Loader2 size={48} className="text-[#FFCC01] animate-spin" />
  //         <p className="text-gray-500 font-medium">Loading VRL Reviews...</p>
  //       </div>
  //     </div>
  //   );
  // }
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FFCC01] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying Login...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <LoginModal
        isOpen={showLoginModal && !user}
        onGoogleLogin={handleGoogleLogin}
        onFacebookLogin={handleFacebookLogin}
        onGuestLogin={handleGuestLogin}
      />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} />
      <WarningModal isOpen={isWarningOpen} onClose={handleCloseWarning} />
      <ScrollToTop />

      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-t-4 border-[#FFCC01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Link href="/">
                <img src="/vrl-logo.png" alt="VRL Logistics" className="h-35 w-auto object-contain" />
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#contact-section" className="text-gray-600 hover:text-[#DC2626] font-medium transition">Contact</a>
              <a href="https://vrllogistics.co.in/services" className="text-gray-600 hover:text-[#DC2626] font-medium transition">Services</a>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#DC2626] hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Write a Review
              </button>


              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center gap-2 group hover:bg-gray-50 p-1.5 rounded-lg transition-all"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border-2 border-gray-200 group-hover:border-[#FFCC01] transition-colors object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border-2 border-transparent group-hover:border-[#FFCC01] transition-colors">
                        <User size={18} />
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-gray-900 leading-none group-hover:text-[#DC2626] transition-colors">
                        {user.displayName ? user.displayName.split(' ')[0] : 'Guest'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">View Profile</span>
                    </div>
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 text-gray-600 hover:text-[#DC2626] font-medium transition">
                  <LogIn size={20} /> Login
                </button>
              )}
              {/* -------------------------------------- */}
            </div>

            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-2">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md border-b border-[#FFCC01] p-4 space-y-4 shadow-xl z-40">
            <a href="#contact-section" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 hover:bg-[#FFF8E1] rounded-lg">Contact</a>
            <a href="https://vrllogistics.co.in/services" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2 hover:bg-[#FFF8E1] rounded-lg">Services</a>

            {/* --- Mobile Menu Login --- */}
            {user ? (
              <button
                onClick={() => { setIsProfileOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 font-bold bg-gray-50 rounded-lg border border-gray-200"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="Profile" />
                ) : <User size={18} />}
                My Profile
              </button>
            ) : (
              <button onClick={() => { setShowLoginModal(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-bold">
                <LogIn size={18} /> Login
              </button>
            )}
            <button onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-[#DC2626] text-white py-3 rounded-lg font-bold">Write a Review</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <div className="relative bg-[#111] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#FFCC01] opacity-10 skew-x-12 transform translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#DC2626] opacity-10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0 z-10 text-center md:text-left">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-[#FFCC01]/30 rounded-full px-4 py-1 mb-6">
              <span className="text-[#FFCC01] font-bold text-sm">★ India's No.1 Logistics Partner</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#DC2626]/20 border border-[#DC2626] rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <CheckCircle size={16} className="text-[#FFCC01]" />
              <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">Genuine & Most Trusted Review Portal</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Trust delivered <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC01] to-yellow-200">Across India</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg leading-relaxed mx-auto md:mx-0">
              Join <span className="text-white font-bold">{stats.total}+</span> happy customers who have shared their genuine relocation experiences with us.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button onClick={() => setIsModalOpen(true)} className="bg-[#FFCC01] text-black px-8 py-3.5 rounded-lg font-bold hover:bg-yellow-400 transition shadow-lg active:scale-95">Share Feedback</button>
            </div>
          </div>

          <div className="md:w-1/3 w-full relative z-10 flex flex-col gap-6">

            {/* --- Stats Card --- */}
            <div className="bg-white/5 backdrop-blur-lg border border-[#FFCC01]/20 p-8 rounded-2xl shadow-2xl relative">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-6xl font-bold text-white">{stats.avg}</span>
                <span className="text-xl text-gray-400 mb-2">/ 5</span>
              </div>
              <div className="mb-4"><StarRating rating={Math.round(stats.avg)} size={6} /></div>

              {/* --- Compact Stats Row (Smart Space Management) --- */}
              <div className="flex items-center justify-between mb-6 border-y border-white/10 py-3">
                {/* Total Reviews Section */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white leading-none">{stats.total}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total</span>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/10"></div>

                {/* Verified Reviews Section (Highlighted) */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#FFCC01] leading-none">{stats.verifiedTotal}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#FFCC01] uppercase tracking-wide leading-tight">Verified</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">Reviews</span>
                  </div>
                </div>
              </div>
              {/* --------------------------------------------------------- */}

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-3 text-gray-400">{star}</span>
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

            {/* --- Live Verified Review Carousel --- */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl relative min-h-[280px] flex flex-col justify-between">

              {/* Header of Card */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{stats.verifiedTotal}</span>
                    <span className="text-sm text-[#FFCC01] font-bold uppercase">Verified Reviews</span>
                  </div>
                  <p className="text-xs text-gray-400">Live updates from real customers</p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 animate-pulse">
                  <CheckCircle size={24} />
                </div>
              </div>

              {/* Animated Review Content (Page Turn Animation) */}
              {verifiedReviews.length > 0 ? (
                <div
                  key={currentVerifiedIndex}
                  className="animate-page-turn"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#FFCC01] text-black flex items-center justify-center font-bold shadow-lg">
                      {verifiedReviews[currentVerifiedIndex].name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm tracking-wide">{verifiedReviews[currentVerifiedIndex].name}</p>
                      <div className="flex text-[#FFCC01]"><StarRating rating={verifiedReviews[currentVerifiedIndex].rating} size={3} /></div>
                    </div>
                  </div>

                  {/* Location Display */}
                  {(verifiedReviews[currentVerifiedIndex].fromLocation || verifiedReviews[currentVerifiedIndex].toLocation) && (
                    <div className="flex items-center gap-2 my-3 text-xs font-medium text-gray-300 bg-white/5 p-2 rounded-lg border border-white/10">
                      <MapPin size={14} className="text-[#FFCC01]" />
                      <span className="truncate max-w-[100px]">{verifiedReviews[currentVerifiedIndex].fromLocation || 'Origin'}</span>
                      <span className="text-gray-500">➝</span>
                      <span className="truncate max-w-[100px]">{verifiedReviews[currentVerifiedIndex].toLocation || 'Dest.'}</span>
                    </div>
                  )}

                  <div className="relative mt-3">
                    <Quote
                      size={24}
                      className="absolute top-0 left-0 text-[#FFCC01] opacity-60 transform scale-x-[-1]"
                    />

                    {/* Text added with left padding (pl-8) to make room for the icon */}
                    <p className="text-gray-200 text-sm italic font-light leading-relaxed pl-8 relative z-10">
                      {verifiedReviews[currentVerifiedIndex].comment.substring(0, 120)}...
                    </p>
                  </div>
                  {/* ----------------------------------- */}

                  <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-3">
                    <span className="text-xs text-gray-400 font-mono tracking-wider">GCN: {verifiedReviews[currentVerifiedIndex].pnr}</span>
                    <span className="bg-[#FFCC01]/20 text-[#FFCC01] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#FFCC01]/30">
                      Verified Customer
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-10 animate-pulse">Waiting for verified reviews...</div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 py-12 -mt-10 relative z-20">
        {error && <div className="bg-red-50 border-l-4 border-[#DC2626] p-4 mb-8 rounded-r-lg"><p className="text-[#DC2626] font-medium">{error}</p></div>}

        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-[#FFCC01] mb-8 flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
            {['All', 'Household', 'Commercial Shifting', 'Car Transport', 'Bike Transport', 'Warehousing'].map((cat) => (
              <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterCategory === cat ? 'bg-[#DC2626] text-white' : 'bg-gray-100 text-gray-600 hover:bg-[#FFF8E1]'}`}>{cat}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
            {/* Verified Only Toggle Button --- */}
            <button
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${showVerifiedOnly ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'}`}
            >
              <CheckCircle size={16} className={showVerifiedOnly ? 'fill-green-500 text-white' : ''} />
              Verified Only
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium hidden sm:block">Sort by:</span>
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCC01]">
                  <option value="Newest">Newest First</option>
                  <option value="Highest">Highest Rated</option>
                  <option value="Lowest">Lowest Rated</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FFCC01] mx-auto mb-4"></div><p>Fetching reviews...</p></div>
        ) : processedReviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <MessageSquare className="text-[#FFCC01] mx-auto mb-6" size={32} />
            <h3 className="text-xl font-bold mb-2">No reviews found</h3>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#DC2626] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-red-700 transition mt-4">Write First Review</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {processedReviews.map((review) => (
              <TiltCard key={review.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl relative overflow-hidden flex flex-col h-full transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFCC01] to-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg border-2 border-white shadow-sm group-hover:border-[#FFCC01] transition-colors">
                      {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#DC2626] transition-colors">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded bg-white">{review.serviceType}</span>
                        {review.verified && (
                          <span className="text-green-700 flex items-center gap-0.5 text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            <CheckCircle size={10} /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleAdminReply(review.id)} className="text-gray-300 hover:text-blue-600 p-1 rounded transition-colors" title="Admin Reply">
                    <Reply size={16} />
                  </button>
                </div>

                {/* --- Display From -> To Location --- */}
                {(review.fromLocation || review.toLocation) && (
                  <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <MapPin size={14} className="text-[#DC2626]" />
                    <span className="truncate max-w-[80px]">{review.fromLocation || 'Origin'}</span>
                    <span className="text-gray-300">➝</span>
                    <span className="truncate max-w-[80px]">{review.toLocation || 'Dest.'}</span>
                  </div>
                )}
                {/* ------------------------------------------- */}

                <div className="mb-3"><StarRating rating={review.rating} size={4} /></div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">"{review.comment}"</p>

                {/* Admin Reply Section */}
                {review.adminReply && (
                  <div className="mt-auto mb-4 bg-amber-50 border-l-4 border-[#FFCC01] p-3 rounded-r text-sm animate-in fade-in slide-in-from-left-2">
                    <p className="font-bold text-gray-900 text-xs mb-1.5 flex items-center gap-1.5">
                      <img src="/vrl-logo.png" className="w-4 h-4 object-contain" alt="Admin" />
                      <span>Official Response</span>
                    </p>
                    <p className="text-gray-700 text-xs leading-relaxed italic">"{review.adminReply}"</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span className="font-mono">GCN: {review.pnr}</span>
                  <span>{review.createdAt ? review.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </main>
      {/* --- CONTACT INFORMATION SECTION --- */}
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
                35, 2nd cross, Hsr Layout, 8th sector,<br />
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

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-[#FFCC01]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <img
                src="/vrl-logo.png"
                alt="VRL Logistics Packers and Movers"
                className="h-42 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
              VRL Logistics Packers and Movers is a well-established logistics company in India, known for its reliable and efficient services.
              The company's loading services are a key part of its comprehensive logistics solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FFCC01]">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition hover:underline"
                >
                  Home
                </a>
              </li>
              <li><a href="https://vrllogistics.co.in/gallery" className="hover:text-white transition hover:underline">Gallery</a></li>
              <li><a href="#contact-section" className="hover:text-white transition hover:underline">Contact</a></li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition hover:underline">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#FFCC01]">Services</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="https://vrllogistics.co.in/home-relocation" className="hover:text-white transition hover:underline">Home Relocation</a></li>
              <li><a href="https://vrllogistics.co.in/car-transportatin" className="hover:text-white transition hover:underline">Car Transportation</a></li>
              <li><a href="https://vrllogistics.co.in/bike-transportation" className="hover:text-white transition hover:underline">Bike Transportation</a></li>
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
