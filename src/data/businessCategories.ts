// Business Categories for Lead Finder
export interface BusinessCategory {
  value: string;
  label: string;
  icon: string;
  googleType: string;
  popular: boolean;
  group: string;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  // Professional Services
  { value: 'lawyer', label: 'Lawyers & Legal Services', icon: '⚖️', googleType: 'lawyer', popular: true, group: 'Professional Services' },
  { value: 'accountant', label: 'Accountants & Tax Services', icon: '💼', googleType: 'accountant', popular: true, group: 'Professional Services' },
  { value: 'consultant', label: 'Business Consultants', icon: '📊', googleType: 'consultant', popular: false, group: 'Professional Services' },
  { value: 'real_estate', label: 'Real Estate Agents', icon: '🏠', googleType: 'real_estate_agency', popular: true, group: 'Professional Services' },
  { value: 'insurance', label: 'Insurance Agencies', icon: '🛡️', googleType: 'insurance_agency', popular: false, group: 'Professional Services' },
  
  // Food & Beverage
  { value: 'restaurant', label: 'Restaurants', icon: '🍽️', googleType: 'restaurant', popular: true, group: 'Food & Beverage' },
  { value: 'cafe', label: 'Cafes & Coffee Shops', icon: '☕', googleType: 'cafe', popular: true, group: 'Food & Beverage' },
  { value: 'bar', label: 'Bars & Pubs', icon: '🍺', googleType: 'bar', popular: false, group: 'Food & Beverage' },
  { value: 'bakery', label: 'Bakeries', icon: '🥖', googleType: 'bakery', popular: false, group: 'Food & Beverage' },
  { value: 'fast_food', label: 'Fast Food', icon: '🍔', googleType: 'meal_takeaway', popular: false, group: 'Food & Beverage' },
  
  // Technology & IT
  { value: 'software', label: 'Software Companies', icon: '💻', googleType: 'software_company', popular: true, group: 'Technology & IT' },
  { value: 'it_services', label: 'IT Services & Support', icon: '🖥️', googleType: 'it_services', popular: true, group: 'Technology & IT' },
  { value: 'web_design', label: 'Web Design & Development', icon: '🎨', googleType: 'web_design', popular: false, group: 'Technology & IT' },
  { value: 'electronics', label: 'Electronics Stores', icon: '📱', googleType: 'electronics_store', popular: false, group: 'Technology & IT' },
  
  // Health & Wellness
  { value: 'doctor', label: 'Doctors & Medical Clinics', icon: '👨‍⚕️', googleType: 'doctor', popular: true, group: 'Health & Wellness' },
  { value: 'dentist', label: 'Dentists', icon: '🦷', googleType: 'dentist', popular: true, group: 'Health & Wellness' },
  { value: 'hospital', label: 'Hospitals', icon: '🏥', googleType: 'hospital', popular: false, group: 'Health & Wellness' },
  { value: 'pharmacy', label: 'Pharmacies', icon: '💊', googleType: 'pharmacy', popular: false, group: 'Health & Wellness' },
  { value: 'gym', label: 'Gyms & Fitness Centers', icon: '💪', googleType: 'gym', popular: true, group: 'Health & Wellness' },
  { value: 'spa', label: 'Spas & Wellness Centers', icon: '🧖', googleType: 'spa', popular: false, group: 'Health & Wellness' },
  
  // Beauty & Personal Care
  { value: 'salon', label: 'Hair Salons & Barbers', icon: '💇', googleType: 'hair_care', popular: true, group: 'Beauty & Personal Care' },
  { value: 'beauty_salon', label: 'Beauty Salons', icon: '💄', googleType: 'beauty_salon', popular: true, group: 'Beauty & Personal Care' },
  { value: 'nail_salon', label: 'Nail Salons', icon: '💅', googleType: 'nail_salon', popular: false, group: 'Beauty & Personal Care' },
  
  // Retail
  { value: 'clothing', label: 'Clothing Stores', icon: '👔', googleType: 'clothing_store', popular: false, group: 'Retail' },
  { value: 'shoe_store', label: 'Shoe Stores', icon: '👟', googleType: 'shoe_store', popular: false, group: 'Retail' },
  { value: 'jewelry', label: 'Jewelry Stores', icon: '💎', googleType: 'jewelry_store', popular: false, group: 'Retail' },
  { value: 'furniture', label: 'Furniture Stores', icon: '🛋️', googleType: 'furniture_store', popular: false, group: 'Retail' },
  { value: 'home_goods', label: 'Home Goods Stores', icon: '🏡', googleType: 'home_goods_store', popular: false, group: 'Retail' },
  { value: 'supermarket', label: 'Supermarkets', icon: '🛒', googleType: 'supermarket', popular: false, group: 'Retail' },
  
  // Automotive
  { value: 'car_dealer', label: 'Car Dealerships', icon: '🚗', googleType: 'car_dealer', popular: true, group: 'Automotive' },
  { value: 'car_repair', label: 'Auto Repair Shops', icon: '🔧', googleType: 'car_repair', popular: false, group: 'Automotive' },
  { value: 'car_wash', label: 'Car Washes', icon: '🚿', googleType: 'car_wash', popular: false, group: 'Automotive' },
  { value: 'gas_station', label: 'Gas Stations', icon: '⛽', googleType: 'gas_station', popular: false, group: 'Automotive' },
  
  // Education
  { value: 'school', label: 'Schools', icon: '🏫', googleType: 'school', popular: false, group: 'Education' },
  { value: 'university', label: 'Universities', icon: '🎓', googleType: 'university', popular: false, group: 'Education' },
  { value: 'training', label: 'Training Centers', icon: '📚', googleType: 'training_center', popular: false, group: 'Education' },
  
  // Hospitality
  { value: 'hotel', label: 'Hotels', icon: '🏨', googleType: 'lodging', popular: true, group: 'Hospitality' },
  { value: 'travel_agency', label: 'Travel Agencies', icon: '✈️', googleType: 'travel_agency', popular: false, group: 'Hospitality' },
  
  // Construction & Home Services
  { value: 'electrician', label: 'Electricians', icon: '⚡', googleType: 'electrician', popular: false, group: 'Construction & Home Services' },
  { value: 'plumber', label: 'Plumbers', icon: '🔩', googleType: 'plumber', popular: false, group: 'Construction & Home Services' },
  { value: 'painter', label: 'Painters', icon: '🎨', googleType: 'painter', popular: false, group: 'Construction & Home Services' },
  { value: 'locksmith', label: 'Locksmiths', icon: '🔑', googleType: 'locksmith', popular: false, group: 'Construction & Home Services' },
  
  // Financial Services
  { value: 'bank', label: 'Banks', icon: '🏦', googleType: 'bank', popular: false, group: 'Financial Services' },
  { value: 'atm', label: 'ATMs', icon: '💳', googleType: 'atm', popular: false, group: 'Financial Services' },
  
  // Entertainment
  { value: 'movie_theater', label: 'Movie Theaters', icon: '🎬', googleType: 'movie_theater', popular: false, group: 'Entertainment' },
  { value: 'night_club', label: 'Night Clubs', icon: '🎉', googleType: 'night_club', popular: false, group: 'Entertainment' },
  { value: 'bowling', label: 'Bowling Alleys', icon: '🎳', googleType: 'bowling_alley', popular: false, group: 'Entertainment' },
];

// Get popular categories
export const getPopularCategories = () => BUSINESS_CATEGORIES.filter(cat => cat.popular);

// Get all categories sorted by label
export const getAllCategories = () => [...BUSINESS_CATEGORIES].sort((a, b) => a.label.localeCompare(b.label));

// Get categories by group
export const getCategoriesByGroup = (group: string) => 
  BUSINESS_CATEGORIES.filter(cat => cat.group === group);

// Get all groups
export const getCategoryGroups = () => {
  const groups = new Set(BUSINESS_CATEGORIES.map(cat => cat.group));
  return Array.from(groups).sort();
};

// Search categories
export const searchCategories = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return BUSINESS_CATEGORIES.filter(cat => 
    cat.label.toLowerCase().includes(lowerQuery) ||
    cat.value.toLowerCase().includes(lowerQuery)
  );
};
