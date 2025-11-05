// South African Cities - Comprehensive List
export const SOUTH_AFRICAN_CITIES = [
  // Gauteng
  { value: 'johannesburg', label: 'Johannesburg', province: 'Gauteng', popular: true },
  { value: 'pretoria', label: 'Pretoria', province: 'Gauteng', popular: true },
  { value: 'sandton', label: 'Sandton', province: 'Gauteng', popular: true },
  { value: 'centurion', label: 'Centurion', province: 'Gauteng', popular: false },
  { value: 'soweto', label: 'Soweto', province: 'Gauteng', popular: false },
  { value: 'benoni', label: 'Benoni', province: 'Gauteng', popular: false },
  { value: 'boksburg', label: 'Boksburg', province: 'Gauteng', popular: false },
  { value: 'germiston', label: 'Germiston', province: 'Gauteng', popular: false },
  { value: 'krugersdorp', label: 'Krugersdorp', province: 'Gauteng', popular: false },
  { value: 'randburg', label: 'Randburg', province: 'Gauteng', popular: false },
  { value: 'roodepoort', label: 'Roodepoort', province: 'Gauteng', popular: false },
  { value: 'midrand', label: 'Midrand', province: 'Gauteng', popular: false },
  
  // Western Cape
  { value: 'cape-town', label: 'Cape Town', province: 'Western Cape', popular: true },
  { value: 'stellenbosch', label: 'Stellenbosch', province: 'Western Cape', popular: false },
  { value: 'paarl', label: 'Paarl', province: 'Western Cape', popular: false },
  { value: 'george', label: 'George', province: 'Western Cape', popular: false },
  { value: 'worcester', label: 'Worcester', province: 'Western Cape', popular: false },
  { value: 'mossel-bay', label: 'Mossel Bay', province: 'Western Cape', popular: false },
  { value: 'knysna', label: 'Knysna', province: 'Western Cape', popular: false },
  { value: 'hermanus', label: 'Hermanus', province: 'Western Cape', popular: false },
  
  // KwaZulu-Natal
  { value: 'durban', label: 'Durban', province: 'KwaZulu-Natal', popular: true },
  { value: 'pietermaritzburg', label: 'Pietermaritzburg', province: 'KwaZulu-Natal', popular: false },
  { value: 'richards-bay', label: 'Richards Bay', province: 'KwaZulu-Natal', popular: false },
  { value: 'newcastle', label: 'Newcastle', province: 'KwaZulu-Natal', popular: false },
  { value: 'ladysmith', label: 'Ladysmith', province: 'KwaZulu-Natal', popular: false },
  
  // Eastern Cape
  { value: 'port-elizabeth', label: 'Port Elizabeth', province: 'Eastern Cape', popular: true },
  { value: 'east-london', label: 'East London', province: 'Eastern Cape', popular: true },
  { value: 'mthatha', label: 'Mthatha', province: 'Eastern Cape', popular: false },
  { value: 'grahamstown', label: 'Grahamstown', province: 'Eastern Cape', popular: false },
  { value: 'queenstown', label: 'Queenstown', province: 'Eastern Cape', popular: false },
  
  // Free State
  { value: 'bloemfontein', label: 'Bloemfontein', province: 'Free State', popular: true },
  { value: 'welkom', label: 'Welkom', province: 'Free State', popular: false },
  { value: 'bethlehem', label: 'Bethlehem', province: 'Free State', popular: false },
  { value: 'kroonstad', label: 'Kroonstad', province: 'Free State', popular: false },
  
  // Limpopo
  { value: 'polokwane', label: 'Polokwane', province: 'Limpopo', popular: true },
  { value: 'tzaneen', label: 'Tzaneen', province: 'Limpopo', popular: false },
  { value: 'thohoyandou', label: 'Thohoyandou', province: 'Limpopo', popular: false },
  { value: 'musina', label: 'Musina', province: 'Limpopo', popular: false },
  
  // Mpumalanga
  { value: 'nelspruit', label: 'Nelspruit', province: 'Mpumalanga', popular: true },
  { value: 'mbombela', label: 'Mbombela', province: 'Mpumalanga', popular: false },
  { value: 'witbank', label: 'Witbank', province: 'Mpumalanga', popular: false },
  { value: 'secunda', label: 'Secunda', province: 'Mpumalanga', popular: false },
  { value: 'middelburg', label: 'Middelburg', province: 'Mpumalanga', popular: false },
  
  // North West
  { value: 'rustenburg', label: 'Rustenburg', province: 'North West', popular: true },
  { value: 'mahikeng', label: 'Mahikeng', province: 'North West', popular: false },
  { value: 'klerksdorp', label: 'Klerksdorp', province: 'North West', popular: false },
  { value: 'potchefstroom', label: 'Potchefstroom', province: 'North West', popular: false },
  
  // Northern Cape
  { value: 'kimberley', label: 'Kimberley', province: 'Northern Cape', popular: true },
  { value: 'upington', label: 'Upington', province: 'Northern Cape', popular: false },
  { value: 'springbok', label: 'Springbok', province: 'Northern Cape', popular: false },
];

// Get popular cities for quick selection
export const getPopularCities = () => SOUTH_AFRICAN_CITIES.filter(city => city.popular);

// Get all cities sorted alphabetically
export const getAllCities = () => [...SOUTH_AFRICAN_CITIES].sort((a, b) => a.label.localeCompare(b.label));

// Get cities by province
export const getCitiesByProvince = (province: string) => 
  SOUTH_AFRICAN_CITIES.filter(city => city.province === province);

// Get all provinces
export const getProvinces = () => {
  const provinces = new Set(SOUTH_AFRICAN_CITIES.map(city => city.province));
  return Array.from(provinces).sort();
};
