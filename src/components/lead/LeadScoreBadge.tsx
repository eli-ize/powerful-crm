import { Badge } from '../ui/badge';
import { Flame, Zap, Snowflake, Moon } from 'lucide-react';

interface LeadScoreBadgeProps {
  score: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LeadScoreBadge({ score, showNumber = true, size = 'md' }: LeadScoreBadgeProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 80) {
      return {
        label: 'Hot Lead',
        icon: Flame,
        className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0',
        emoji: '🔥',
      };
    } else if (score >= 60) {
      return {
        label: 'Warm Lead',
        icon: Zap,
        className: 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white border-0',
        emoji: '⚡',
      };
    } else if (score >= 40) {
      return {
        label: 'Cold Lead',
        icon: Snowflake,
        className: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-0',
        emoji: '❄️',
      };
    } else {
      return {
        label: 'Low Priority',
        icon: Moon,
        className: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0',
        emoji: '💤',
      };
    }
  };

  const config = getScoreConfig(score);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} font-semibold`}>
      <span className="mr-1">{config.emoji}</span>
      {config.label}
      {showNumber && <span className="ml-1.5 font-bold">{score}</span>}
    </Badge>
  );
}

// Helper function to calculate lead score (can be used in frontend)
export function calculateLeadScore(place: {
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  formatted_phone_number?: string;
  phone?: string;
  business_status?: string;
}): number {
  let score = 50; // Base score

  // Rating bonus (3.0 = +0, 5.0 = +20)
  if (place.rating) {
    score += Math.round((place.rating - 3) * 10);
  }

  // Reviews bonus
  if (place.user_ratings_total) {
    if (place.user_ratings_total > 500) score += 15;
    else if (place.user_ratings_total > 100) score += 10;
    else if (place.user_ratings_total > 50) score += 5;
  }

  // Website bonus
  if (place.website) {
    score += 15;
  }

  // Phone bonus
  if (place.formatted_phone_number || place.phone) {
    score += 10;
  }

  // Business status
  if (place.business_status === 'OPERATIONAL') {
    score += 5;
  }

  // Clamp between 0-100
  return Math.min(Math.max(score, 0), 100);
}
