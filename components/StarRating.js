import { Star } from 'lucide-react';

// Props:
// rating: the number of stars (1-5)
// setRating: function to change stars (if clickable)
// interactive: true if user can click it, false if it's just for display
export default function StarRating({ rating, setRating, interactive = false, size = 5 }) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive} // Disable clicking if not interactive
          onClick={() => interactive && setRating(star)}
          className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-110' : ''}`}
        >
          <Star
            // Multiply size prop by 4 to get Tailwind classes (size 5 = 20px)
            size={size * 4}
            className={`${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' // Gold color for active stars
                : 'fill-gray-200 text-gray-200'     // Grey for inactive
            }`}
          />
        </button>
      ))}
    </div>
  );
}