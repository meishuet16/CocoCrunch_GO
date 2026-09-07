import React, { useMemo, useState, useEffect } from 'react';
import {
  Compass, Filter, Globe, Heart, MapPin, Search, SlidersHorizontal,
  Sparkles, X, ChevronRight, BookOpen, Layers, CheckCircle2, Bookmark, Check,
  ChevronLeft, Clock, Users, Wallet, CloudRain, Send
} from 'lucide-react';
import { EarthCenterpiece } from './EarthCenterpiece';
import { CommunityTripCard, type CommunityTripItem } from './CommunityTripCard';
import { ExplorePlaceCard, type PlaceCandidate } from './ExplorePlaceCard';
import { ExplorePlanningGuide } from '../JourneyPhaseGuide';
import type { TingoDimensions, TingoBehavior } from '../../domain/tingo';
import { getCommunityTripCover, getStopThumbnail, getPlacePhoto } from './explorePhotos';

export interface SavedIdeaItem {
  name: string;
  source: string;
}

export type TravelCategoryFilter = 'All' | 'Duration' | 'Budget' | 'Solo' | 'Family' | 'Adventure';

export interface CountryOption {
  id: string;
  name: string;
  flag: string;
  destinations?: string[];
}

export const ALPHABETICAL_COUNTRIES: CountryOption[] = [
  { id: 'all', name: 'All Countries', flag: '🌐' },
  { id: 'argentina', name: 'Argentina', flag: '🇦🇷', destinations: ['Buenos Aires', 'Bariloche', 'Mendoza'] },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', destinations: ['Sydney', 'Melbourne', 'Perth'] },
  { id: 'austria', name: 'Austria', flag: '🇦🇹', destinations: ['Vienna', 'Salzburg', 'Innsbruck'] },
  { id: 'azerbaijan', name: 'Azerbaijan', flag: '🇦🇿', destinations: ['Baku', 'Sheki'] },
  { id: 'belgium', name: 'Belgium', flag: '🇧🇪', destinations: ['Brussels', 'Bruges', 'Ghent'] },
  { id: 'bhutan', name: 'Bhutan', flag: '🇧🇹', destinations: ['Thimphu', 'Paro'] },
  { id: 'bolivia', name: 'Bolivia', flag: '🇧🇴', destinations: ['La Paz', 'Salar de Uyuni'] },
  { id: 'brazil', name: 'Brazil', flag: '🇧🇷', destinations: ['Rio de Janeiro', 'São Paulo', 'Salvador'] },
  { id: 'cambodia', name: 'Cambodia', flag: '🇰🇭', destinations: ['Siem Reap', 'Phnom Penh'] },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', destinations: ['Vancouver', 'Banff', 'Toronto', 'Montreal'] },
  { id: 'chile', name: 'Chile', flag: '🇨🇱', destinations: ['Santiago', 'San Pedro de Atacama'] },
  { id: 'china', name: 'China', flag: '🇨🇳', destinations: ['Shanghai', 'Beijing', 'Chengdu', 'Guilin'] },
  { id: 'colombia', name: 'Colombia', flag: '🇨🇴', destinations: ['Medellín', 'Cartagena', 'Bogotá'] },
  { id: 'costa-rica', name: 'Costa Rica', flag: '🇨🇷', destinations: ['San José', 'La Fortuna', 'Manuel Antonio'] },
  { id: 'croatia', name: 'Croatia', flag: '🇭🇷', destinations: ['Dubrovnik', 'Split', 'Zadar'] },
  { id: 'czech-republic', name: 'Czech Republic', flag: '🇨🇿', destinations: ['Prague', 'Český Krumlov'] },
  { id: 'denmark', name: 'Denmark', flag: '🇩🇰', destinations: ['Copenhagen', 'Aarhus'] },
  { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨', destinations: ['Quito', 'Galápagos', 'Cuenca'] },
  { id: 'egypt', name: 'Egypt', flag: '🇪🇬', destinations: ['Cairo', 'Luxor', 'Aswan'] },
  { id: 'fiji', name: 'Fiji', flag: '🇫🇯', destinations: ['Nadi', 'Suva', 'Mamanuca Islands'] },
  { id: 'finland', name: 'Finland', flag: '🇫🇮', destinations: ['Helsinki', 'Rovaniemi'] },
  { id: 'france', name: 'France', flag: '🇫🇷', destinations: ['Paris', 'Nice', 'Lyon', 'Bordeaux'] },
  { id: 'georgia', name: 'Georgia', flag: '🇬🇪', destinations: ['Tbilisi', 'Batumi', 'Kazbegi'] },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', destinations: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'] },
  { id: 'greece', name: 'Greece', flag: '🇬🇷', destinations: ['Athens', 'Santorini', 'Mykonos', 'Crete'] },
  { id: 'hong-kong', name: 'Hong Kong', flag: '🇭🇰', destinations: ['Hong Kong'] },
  { id: 'hungary', name: 'Hungary', flag: '🇭🇺', destinations: ['Budapest'] },
  { id: 'iceland', name: 'Iceland', flag: '🇮🇸', destinations: ['Reykjavik', 'Vik', 'Akureyri'] },
  { id: 'india', name: 'India', flag: '🇮🇳', destinations: ['New Delhi', 'Jaipur', 'Mumbai', 'Goa'] },
  { id: 'indonesia', name: 'Indonesia', flag: '🇮🇩', destinations: ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok'] },
  { id: 'ireland', name: 'Ireland', flag: '🇮🇪', destinations: ['Dublin', 'Galway', 'Cork'] },
  { id: 'italy', name: 'Italy', flag: '🇮🇹', destinations: ['Rome', 'Florence', 'Venice', 'Milan'] },
  { id: 'japan', name: 'Japan', flag: '🇯🇵', destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Sapporo', 'Fukuoka'] },
  { id: 'jordan', name: 'Jordan', flag: '🇯🇴', destinations: ['Amman', 'Petra', 'Wadi Rum'] },
  { id: 'kenya', name: 'Kenya', flag: '🇰🇪', destinations: ['Nairobi', 'Masai Mara', 'Mombasa'] },
  { id: 'laos', name: 'Laos', flag: '🇱🇦', destinations: ['Luang Prabang', 'Vientiane'] },
  { id: 'malaysia', name: 'Malaysia', flag: '🇲🇾', destinations: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Sabah'] },
  { id: 'maldives', name: 'Maldives', flag: '🇲🇻', destinations: ['Malé', 'Maafushi'] },
  { id: 'mexico', name: 'Mexico', flag: '🇲🇽', destinations: ['Mexico City', 'Cancún', 'Oaxaca'] },
  { id: 'mongolia', name: 'Mongolia', flag: '🇲🇳', destinations: ['Ulaanbaatar', 'Gobi'] },
  { id: 'morocco', name: 'Morocco', flag: '🇲🇦', destinations: ['Marrakech', 'Fes', 'Chefchaouen'] },
  { id: 'nepal', name: 'Nepal', flag: '🇳🇵', destinations: ['Kathmandu', 'Pokhara'] },
  { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱', destinations: ['Amsterdam', 'Rotterdam', 'Utrecht'] },
  { id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿', destinations: ['Queenstown', 'Auckland', 'Rotorua'] },
  { id: 'norway', name: 'Norway', flag: '🇳🇴', destinations: ['Oslo', 'Bergen', 'Tromsø'] },
  { id: 'oman', name: 'Oman', flag: '🇴🇲', destinations: ['Muscat', 'Salalah'] },
  { id: 'peru', name: 'Peru', flag: '🇵🇪', destinations: ['Cusco', 'Lima', 'Machu Picchu'] },
  { id: 'philippines', name: 'Philippines', flag: '🇵🇭', destinations: ['Manila', 'Boracay', 'Palawan', 'Cebu'] },
  { id: 'poland', name: 'Poland', flag: '🇵🇱', destinations: ['Kraków', 'Warsaw', 'Gdańsk'] },
  { id: 'portugal', name: 'Portugal', flag: '🇵🇹', destinations: ['Lisbon', 'Porto', 'Algarve'] },
  { id: 'qatar', name: 'Qatar', flag: '🇶🇦', destinations: ['Doha'] },
  { id: 'romania', name: 'Romania', flag: '🇷🇴', destinations: ['Bucharest', 'Brașov', 'Sibiu'] },
  { id: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦', destinations: ['Riyadh', 'Jeddah', 'AlUla'] },
  { id: 'singapore', name: 'Singapore', flag: '🇸🇬', destinations: ['Singapore'] },
  { id: 'south-africa', name: 'South Africa', flag: '🇿🇦', destinations: ['Cape Town', 'Johannesburg', 'Kruger'] },
  { id: 'south-korea', name: 'South Korea', flag: '🇰🇷', destinations: ['Seoul', 'Jeju', 'Busan'] },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', destinations: ['Barcelona', 'Madrid', 'Seville', 'Valencia'] },
  { id: 'sri-lanka', name: 'Sri Lanka', flag: '🇱🇰', destinations: ['Colombo', 'Kandy', 'Galle', 'Ella'] },
  { id: 'sweden', name: 'Sweden', flag: '🇸🇪', destinations: ['Stockholm', 'Gothenburg'] },
  { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭', destinations: ['Zurich', 'Interlaken', 'Geneva', 'Lucerne'] },
  { id: 'taiwan', name: 'Taiwan', flag: '🇹🇼', destinations: ['Taipei', 'Tainan', 'Kaohsiung', 'Hualien'] },
  { id: 'tanzania', name: 'Tanzania', flag: '🇹🇿', destinations: ['Zanzibar', 'Serengeti', 'Kilimanjaro'] },
  { id: 'thailand', name: 'Thailand', flag: '🇹🇭', destinations: ['Bangkok', 'Chiang Mai', 'Phuket', 'Krabi'] },
  { id: 'turkey', name: 'Turkey', flag: '🇹🇷', destinations: ['Istanbul', 'Cappadocia', 'Antalya'] },
  { id: 'united-arab-emirates', name: 'United Arab Emirates', flag: '🇦🇪', destinations: ['Dubai', 'Abu Dhabi'] },
  { id: 'united-kingdom', name: 'United Kingdom', flag: '🇬🇧', destinations: ['London', 'Edinburgh', 'Manchester', 'Bath'] },
  { id: 'united-states', name: 'United States', flag: '🇺🇸', destinations: ['New York', 'San Francisco', 'Los Angeles', 'Honolulu'] },
  { id: 'uzbekistan', name: 'Uzbekistan', flag: '🇺🇿', destinations: ['Samarkand', 'Bukhara', 'Tashkent'] },
  { id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', destinations: ['Hanoi', 'Da Nang', 'Ho Chi Minh City', 'Hoi An'] },
];

export const COUNTRIES = ALPHABETICAL_COUNTRIES;
export type CountryFilter = string;

export type TripPlaceItem = {
  id: number;
  name: string;
  type: string;
  match: number;
  cost?: string;
  duration?: string;
  why: string;
  saved: boolean;
  added?: boolean;
  photoUrl?: string;
};

export type DetailState =
  | { kind: 'trip'; item: CommunityTripItem }
  | { kind: 'place'; item: TripPlaceItem; returnToTrip?: CommunityTripItem }
  | null;

export interface ExploreScreenProps {
  // Trip context
  activeTripDestination: string;
  mode: 'group' | 'solo';
  tingoBehavior: TingoBehavior;
  tingoDimensions: TingoDimensions;

  // Recommendations & Candidates
  placeRecommendations: PlaceCandidate[];
  onSavePlace: (id: number) => void;
  onAddPlace: (id: number) => void;

  // Community trips
  communityTrips: CommunityTripItem[];
  onToggleSaveCommunityTrip: (id: number) => void;

  // Ritual / Saved Ideas
  savedIdeas?: SavedIdeaItem[];

  // Navigation callbacks
  onOpenTripPlanning: () => void;
  onSearchPlaces?: (destination: string) => void;

  // Optional initial detail view (for direct linking / testing)
  initialDetail?: DetailState;
}

const CATEGORIES: TravelCategoryFilter[] = ['All', 'Duration', 'Budget', 'Solo', 'Family', 'Adventure'];

// Enriched community data seeds for realistic, truthful preview
const defaultCommunitySeeds: Record<number, Partial<CommunityTripItem>> = {
  1: {
    destination: 'Tokyo',
    days: 5,
    budget: 'RM 1,400 est.',
    category: 'Solo',
    highlights: ['Tsukiji food walk', 'Daikanyama café stroll', 'Shimokitazawa vintage'],
    stopsCount: 8,
    places: 12,
    description: 'A five-day trip filled with good food, little shops and unexpected moments. Hope this helps you plan your own Tokyo adventure!',
  },
  2: {
    destination: 'Tokyo',
    days: 3,
    budget: 'RM 850 est.',
    category: 'Budget',
    highlights: ['Tokyo Station underground', 'Mori Art Museum', 'Ginza covered arcade'],
    stopsCount: 6,
    places: 8,
    description: 'Rain-friendly cafés, covered streets and a gentler pace for a Tokyo weekend.',
  },
  3: {
    destination: 'Kyoto',
    days: 4,
    budget: 'RM 1,100 est.',
    category: 'Duration',
    highlights: ['Nishiki Market', 'Philosopher’s Path walk', 'Gion tea ceremony'],
    stopsCount: 7,
    places: 7,
    description: 'Quiet cafés, local sweets and small streets worth slowing down for.',
  },
  4: {
    destination: 'Osaka',
    days: 4,
    budget: 'RM 1,250 est.',
    category: 'Family',
    highlights: ['Kuromon Market', 'Osaka Castle Park', 'Dotonbori riverside evening'],
    stopsCount: 9,
    places: 9,
    description: 'Street food trails, lively markets and neon nights at a comfortable pace for families and friends.',
  },
};

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  activeTripDestination,
  mode,
  tingoBehavior,
  tingoDimensions,
  placeRecommendations,
  onSavePlace,
  onAddPlace,
  communityTrips,
  onToggleSaveCommunityTrip,
  savedIdeas = [],
  onOpenTripPlanning,
  onSearchPlaces,
  initialDetail = null,
}) => {
  // Search query states - decoupled from active trip destination!
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryFilter>('All');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchInput, setCountrySearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TravelCategoryFilter>('All');
  const [selectedDestination, setSelectedDestination] = useState(activeTripDestination || 'Tokyo');
  const [detail, setDetail] = useState<DetailState>(initialDetail);
  const [toast, setToast] = useState<string | null>(null);
  const [followingAuthors, setFollowingAuthors] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'community'>('all');

  // Auto-dismiss toast feedback
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Handle Escape key to close detail view
  useEffect(() => {
    if (!detail) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detail.kind === 'place' && detail.returnToTrip) {
          setDetail({ kind: 'trip', item: detail.returnToTrip });
        } else {
          setDetail(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detail]);

  const toggleFollowAuthor = (author: string) => {
    setFollowingAuthors(prev => {
      const nextState = !prev[author];
      setToast(nextState ? `Following ${author}` : `Unfollowed ${author}`);
      return { ...prev, [author]: nextState };
    });
  };

  // Backward compatibility alias for any callers expecting setSelectedPlanModal
  const setSelectedPlanModal = (trip: CommunityTripItem | null) => {
    setDetail(trip ? { kind: 'trip', item: trip } : null);
  };

  // Filtered country list for modal search
  const displayedCountries = useMemo(() => {
    if (!countrySearchInput.trim()) return ALPHABETICAL_COUNTRIES;
    const q = countrySearchInput.toLowerCase().trim();
    return ALPHABETICAL_COUNTRIES.filter(
      c => c.id === 'all' ||
           c.name.toLowerCase().includes(q) ||
           c.destinations?.some(d => d.toLowerCase().includes(q))
    );
  }, [countrySearchInput]);

  // Handle destination switch from EarthCenterpiece
  const handleDestinationSelect = (dest: string) => {
    setSelectedDestination(dest);
    onSearchPlaces?.(dest);
  };

  // Handle country filter selection
  const handleCountrySelect = (countryId: CountryFilter) => {
    setSelectedCountry(countryId);
    setCountryDropdownOpen(false);
    setCountrySearchInput('');

    const found = ALPHABETICAL_COUNTRIES.find(
      c => c.id === countryId || c.name.toLowerCase() === countryId.toLowerCase()
    );

    if (found && found.destinations && found.destinations.length > 0) {
      setSelectedDestination(found.destinations[0]);
      onSearchPlaces?.(found.destinations[0]);
    } else if (countryId === 'All' || countryId === 'all') {
      setSelectedDestination(activeTripDestination || 'Tokyo');
      onSearchPlaces?.(activeTripDestination || 'Tokyo');
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // Check if user queried a known destination
      const lower = query.toLowerCase();
      if (['tokyo', 'kyoto', 'osaka'].includes(lower)) {
        setSelectedDestination(query.charAt(0).toUpperCase() + query.slice(1).toLowerCase());
      }
      onSearchPlaces?.(query);
    }
  };

  // Enrich community trips with metadata
  const enrichedCommunityTrips = useMemo(() => {
    const base: CommunityTripItem[] = communityTrips.map(trip => {
      const seed = defaultCommunitySeeds[trip.id] || {};
      const dest = trip.destination || seed.destination || (trip.title.toLowerCase().includes('kyoto') ? 'Kyoto' : trip.title.toLowerCase().includes('osaka') ? 'Osaka' : trip.title.toLowerCase().includes('jeju') ? 'Jeju' : 'Tokyo');
      const country = trip.country || seed.country || (['tokyo', 'kyoto', 'osaka'].includes(dest.toLowerCase()) ? 'Japan' : 'South Korea');
      return {
        ...trip,
        destination: dest,
        country,
        ...seed,
        description: trip.description || seed.description || `A curated ${trip.days ?? seed.days ?? 4}-day travel itinerary featuring favorite local spots, scenic walking streets, and relaxing pacing in ${dest}.`,
        places: trip.places || seed.places || seed.stopsCount || 8,
      };
    });

    if (!base.some(t => t.country === 'South Korea')) {
      base.push({
        id: 5,
        title: 'Jeju: salt air and citrus',
        author: 'Sora',
        match: 89,
        saved: false,
        destination: 'Jeju',
        country: 'South Korea',
        days: 5,
        budget: 'RM 1,300 est.',
        category: 'Adventure',
        highlights: ['Seongsan sunrise', 'O’sulloc green tea farm', 'Aewol coastal café walk'],
        stopsCount: 7,
        places: 7,
        description: 'Coastal breeze, basalt beaches, and slow tea stops across the volcanic island of Jeju.',
      });
    }

    const internationalSeeds: Array<CommunityTripItem & { destination: string; country: string }> = [
      {
        id: 6,
        title: 'Taipei: night markets and tea hills',
        author: 'Wei',
        match: 92,
        saved: false,
        destination: 'Taipei',
        country: 'Taiwan',
        days: 4,
        budget: 'RM 980 est.',
        category: 'Solo',
        highlights: ['Shilin night market crawl', 'Jiufen tea house evening', 'Xiangshan sunset hike'],
        stopsCount: 8,
        places: 8,
        description: 'A sensory journey through bustling night markets, mountain tea houses, and lantern-lit alleyways.',
      },
      {
        id: 7,
        title: 'Tuscany: quiet stone lanes & vineyards',
        author: 'Elena',
        match: 94,
        saved: false,
        destination: 'Florence',
        country: 'Italy',
        days: 6,
        budget: 'RM 2,100 est.',
        category: 'Adventure',
        highlights: ['Uffizi gallery morning', 'Chianti vineyard trail', 'Ponte Vecchio walk'],
        stopsCount: 9,
        places: 9,
        description: 'Sun-drenched vineyards, Renaissance art, and relaxed trattoria dinners along cobblestone streets.',
      },
      {
        id: 8,
        title: 'Paris: Seine bookstalls & café terraces',
        author: 'Camille',
        match: 91,
        saved: false,
        destination: 'Paris',
        country: 'France',
        days: 5,
        budget: 'RM 2,300 est.',
        category: 'Budget',
        highlights: ['Le Marais bakery crawl', 'Montmartre artists square', 'Seine riverbanks at dusk'],
        stopsCount: 7,
        places: 7,
        description: 'Artful strolls past bookstalls, morning pain au chocolat, and sunset views over the Seine.',
      },
      {
        id: 9,
        title: 'Bangkok: street food maps & river boats',
        author: 'Somchai',
        match: 95,
        saved: false,
        destination: 'Bangkok',
        country: 'Thailand',
        days: 4,
        budget: 'RM 750 est.',
        category: 'Solo',
        highlights: ['Yaowarat street food crawl', 'Chao Phraya express boat', 'Wat Arun sunset'],
        stopsCount: 8,
        places: 8,
        description: 'Flavor-packed night markets, historic riverways, and glittering temple spires at your own tempo.',
      },
      {
        id: 10,
        title: 'Iceland: waterfalls & black sand silence',
        author: 'Freja',
        match: 90,
        saved: false,
        destination: 'Reykjavik',
        country: 'Iceland',
        days: 5,
        budget: 'RM 2,600 est.',
        category: 'Adventure',
        highlights: ['Seljalandsfoss waterfall', 'Reynisfjara black beach', 'Blue Lagoon hot spring'],
        stopsCount: 6,
        places: 6,
        description: 'Vast dramatic volcanic horizons, roaring glacial cascades, and soothing geothermal hot springs.',
      },
      {
        id: 11,
        title: 'Melbourne: laneway espresso & coast',
        author: 'Liam',
        match: 88,
        saved: false,
        destination: 'Melbourne',
        country: 'Australia',
        days: 5,
        budget: 'RM 1,900 est.',
        category: 'Family',
        highlights: ['Degraves Street coffee walk', 'Twelve Apostles coastal drive', 'Fitzroy vintage hunt'],
        stopsCount: 8,
        places: 8,
        description: 'Specialty coffee roasters, hidden graffiti laneways, and dramatic ocean views along the coastal drive.',
      },
    ];

    internationalSeeds.forEach(item => {
      if (!base.some(t => t.id === item.id || t.country === item.country)) {
        base.push(item);
      }
    });

    return base;
  }, [communityTrips]);

  // Filter community trips based on search query, country, and category
  const filteredCommunityTrips = useMemo(() => {
    return enrichedCommunityTrips.filter(trip => {
      // Country filter
      if (selectedCountry !== 'All' && selectedCountry !== 'all') {
        const found = ALPHABETICAL_COUNTRIES.find(
          c => c.id === selectedCountry || c.name.toLowerCase() === selectedCountry.toLowerCase()
        );
        const countryName = (found ? found.name : selectedCountry).toLowerCase();
        const tripCountry = (trip.country || '').toLowerCase();
        const tripDest = (trip.destination || '').toLowerCase();
        const matchesCountry = tripCountry === countryName || tripCountry === selectedCountry.toLowerCase();
        const matchesDest = found?.destinations?.some(d => d.toLowerCase() === tripDest);
        if (!matchesCountry && !matchesDest) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Duration' && (trip.days ?? 0) > 4) return true;
        if (selectedCategory === 'Budget' && trip.budget?.includes('850')) return true;
        if (selectedCategory === 'Solo' && trip.category === 'Solo') return true;
        if (selectedCategory === 'Family' && trip.category === 'Family') return true;
        if (selectedCategory === 'Adventure' && (trip.match ?? 0) >= 88) return true;
        // Fallback match on title/highlights
        const matchCategory = trip.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          trip.highlights?.some(h => h.toLowerCase().includes(selectedCategory.toLowerCase()));
        if (!matchCategory && trip.category !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = trip.title.toLowerCase().includes(q);
        const matchesAuthor = trip.author.toLowerCase().includes(q);
        const matchesDest = (trip.destination ?? '').toLowerCase().includes(q);
        const matchesCountry = (trip.country ?? '').toLowerCase().includes(q);
        const matchesHighlights = trip.highlights?.some(h => h.toLowerCase().includes(q));
        return matchesTitle || matchesAuthor || matchesDest || matchesCountry || matchesHighlights;
      }

      return true;
    });
  }, [enrichedCommunityTrips, selectedCountry, selectedCategory, searchQuery]);

  // Filter place recommendations
  const filteredPlaces = useMemo(() => {
    let list = placeRecommendations;

    if (selectedCountry !== 'All' && selectedCountry !== 'all') {
      const found = ALPHABETICAL_COUNTRIES.find(
        c => c.id === selectedCountry || c.name.toLowerCase() === selectedCountry.toLowerCase()
      );
      const countryName = (found ? found.name : selectedCountry).toLowerCase();
      const isJapan = countryName === 'japan';
      const isJapanDest = ['tokyo', 'kyoto', 'osaka'].includes(selectedDestination.toLowerCase());
      if (isJapan && !isJapanDest) list = [];
      if (!isJapan && isJapanDest) list = [];
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(place =>
      place.name.toLowerCase().includes(q) ||
      place.type.toLowerCase().includes(q) ||
      place.why.toLowerCase().includes(q) ||
      place.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [placeRecommendations, selectedCountry, selectedDestination, searchQuery]);

  return (
    <div className="explore-screen modern-explore" role="region" aria-label="Community Trip Explore">
      {/* 1. Header Section */}
      <header className="explore-page-header">
        <div className="explore-header-lockup">
          <span className="explore-kicker">EXPLORE · TRAVEL DISCOVERY</span>
          <h2 className="explore-title">Borrow a feeling, make it yours.</h2>
          <p className="explore-subtitle">
            Discover places and itineraries shared by travellers. Save candidates for your trip, or suggest them to the group.
          </p>
        </div>
      </header>

      {/* Governance Planning Guide */}
      <ExplorePlanningGuide onOpenTrip={onOpenTripPlanning} />

      {/* 2. Top Section (Search & Discovery) */}
      <section className="explore-search-discovery-section" aria-label="Search and Discovery">
        {/* Search Row: Search Input + Country Filter Button on the same level */}
        <div className="explore-search-row">
          <form className="explore-search-bar" onSubmit={handleSearchSubmit} role="search">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="explore-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tokyo, Kyoto, Osaka, cafés, vintage..."
              aria-label="Search destinations, tags, or itineraries"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
              >
                <X size={15} />
              </button>
            )}
            <button type="submit" className="search-submit-btn">
              Search
            </button>
          </form>

          {/* Filter icon button on the same level as search bar */}
          <button
            type="button"
            className={`country-filter-btn ${countryDropdownOpen ? 'active' : ''} ${selectedCountry !== 'all' && selectedCountry !== 'All' ? 'has-filter' : ''}`}
            onClick={() => setCountryDropdownOpen(prev => !prev)}
            aria-expanded={countryDropdownOpen}
            aria-haspopup="listbox"
            aria-label="Country filters"
            title="Filter by country (A–Z)"
          >
            <SlidersHorizontal size={18} className="filter-icon" aria-hidden="true" />
            {selectedCountry !== 'all' && selectedCountry !== 'All' && (
              <span className="country-filter-active-dot" aria-label="Country filter active" />
            )}
          </button>
        </div>

        {/* Country Filter Pop-up Modal with circle floating close button down it */}
        <div
          className={`country-modal-overlay country-dropdown-panel ${countryDropdownOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Country filters"
          aria-hidden={!countryDropdownOpen}
          onClick={() => setCountryDropdownOpen(false)}
        >
          <div className="country-modal-container">
            <div
              className="country-modal-card paper-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="country-modal-header">
                <div className="country-header-title-wrap">
                  <div className="country-modal-title">
                    <Globe size={15} className="country-header-icon" aria-hidden="true" />
                    <span>Country: (A–Z)</span>
                  </div>
                  <small className="country-modal-subtitle">Filter community itineraries & places</small>
                </div>
                <span className="country-count-pill">
                  {ALPHABETICAL_COUNTRIES.length - 1} Countries
                </span>
              </div>

              {/* Quick in-modal search input */}
              <div className="country-modal-search">
                <Search size={13} className="country-modal-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  className="country-modal-search-input"
                  placeholder="Filter from 69+ countries..."
                  value={countrySearchInput}
                  onChange={(e) => setCountrySearchInput(e.target.value)}
                  aria-label="Filter country list"
                />
                {countrySearchInput && (
                  <button
                    type="button"
                    className="country-search-clear-btn"
                    onClick={() => setCountrySearchInput('')}
                    aria-label="Clear search input"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div
                className="country-scroll-list"
                tabIndex={0}
                role="listbox"
                aria-label="Alphabetical country list"
              >
                {displayedCountries.map(country => {
                  const isSelected =
                    selectedCountry === country.id ||
                    selectedCountry.toLowerCase() === country.name.toLowerCase() ||
                    ((selectedCountry === 'all' || selectedCountry === 'All') && country.id === 'all');

                  return (
                    <button
                      key={country.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`country-option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCountrySelect(country.id)}
                    >
                      <span className="country-flag" aria-hidden="true">{country.flag}</span>
                      <span className="country-name">{country.name}</span>
                      {isSelected && (
                        <Check size={15} className="country-check-icon" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}

                {displayedCountries.length === 0 && (
                  <div className="empty-country-search">
                    <p>No countries match "{countrySearchInput}".</p>
                    <button
                      type="button"
                      className="reset-country-search-btn"
                      onClick={() => setCountrySearchInput('')}
                    >
                      Show all countries
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Circle floating close button down it */}
            <button
              type="button"
              className="floating-close-circle-btn"
              onClick={() => setCountryDropdownOpen(false)}
              aria-label="Close country filter"
            >
              <X size={22} className="floating-close-icon" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Active Filter Indicator Tag */}
        {selectedCountry !== 'all' && selectedCountry !== 'All' && (
          <div className="active-country-filter-indicator">
            <span className="indicator-label">Country:</span>
            <span className="active-country-pill">
              <span className="pill-flag">
                {ALPHABETICAL_COUNTRIES.find(c => c.id === selectedCountry || c.name.toLowerCase() === selectedCountry.toLowerCase())?.flag || '🌐'}
              </span>
              <span className="pill-text">
                {ALPHABETICAL_COUNTRIES.find(c => c.id === selectedCountry || c.name.toLowerCase() === selectedCountry.toLowerCase())?.name || selectedCountry}
              </span>
              <button
                type="button"
                className="clear-country-pill-btn"
                onClick={() => handleCountrySelect('all')}
                aria-label="Clear country filter"
              >
                <X size={12} />
              </button>
            </span>
          </div>
        )}

        {/* Category Filter Chips / Dropdowns */}
        <div className="explore-filter-row" role="toolbar" aria-label="Travel category filters">
          <div className="filter-chips-scroll">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  className={`filter-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isSelected}
                >
                  {category === 'All' ? '✦ All Categories' : category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Centerpiece Visual: Earth / Visited Places */}
        <EarthCenterpiece
          destinationsCovered={['Tokyo', 'Kyoto', 'Osaka']}
          totalItineraries={12}
          activeDestination={selectedDestination}
          onSelectDestination={handleDestinationSelect}
        />
      </section>

      {/* Active Destination Feedback Banner if searching */}
      {selectedDestination && (
        <div className="destination-context-banner">
          <div className="dest-banner-left">
            <MapPin size={13} />
            <span>Browsing <b>{selectedDestination}</b></span>
            {selectedDestination.toLowerCase() !== activeTripDestination.toLowerCase() && (
              <small className="dest-isolation-note">
                (Active trip remains {activeTripDestination})
              </small>
            )}
          </div>
          <span className="dest-match-pill">
            {tingoBehavior.recommendationBias}-first discovery
          </span>
        </div>
      )}

      {/* Saved Ideas Section (if any saved) */}
      {savedIdeas.length > 0 && (
        <section className="explore-saved-shelf paper-sheet" aria-label="Saved trip ideas">
          <div className="shelf-header">
            <div className="shelf-title-lockup">
              <Bookmark size={15} className="shelf-icon" />
              <h3>Saved ideas for this trip · {savedIdeas.length}</h3>
            </div>
            <small className="shelf-badge">Kept candidates</small>
          </div>
          <div className="saved-ideas-list">
            {savedIdeas.map((idea, idx) => (
              <div key={`${idea.name}-${idx}`} className="saved-idea-pill">
                <b>{idea.name}</b>
                <small>· {idea.source === 'prototype-catalog' ? 'catalog' : idea.source}</small>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content Stream Navigation Tabs */}
      <nav className="explore-view-tabs" aria-label="Content view tabs">
        <button
          type="button"
          className={`view-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Discoveries
        </button>
        <button
          type="button"
          className={`view-tab ${activeTab === 'places' ? 'active' : ''}`}
          onClick={() => setActiveTab('places')}
        >
          Places ({filteredPlaces.length})
        </button>
        <button
          type="button"
          className={`view-tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community Trips ({filteredCommunityTrips.length})
        </button>
      </nav>

      {/* 3. Places Section: Destination Candidates */}
      {(activeTab === 'all' || activeTab === 'places') && (
        <section className="explore-places-section" aria-label="Place recommendations">
          <div className="explore-section-heading">
            <div className="heading-title-group">
              <span>PLACES FOR YOUR TRIP</span>
              <small>Tingo-ranked candidates</small>
            </div>
            <span className="provenance-quiet-tag">Truthful provenance</span>
          </div>

          <div className="places-card-grid">
            {filteredPlaces.map(place => (
              <ExplorePlaceCard
                key={place.id}
                place={place}
                mode={mode}
                onSave={onSavePlace}
                onAdd={onAddPlace}
              />
            ))}
            {filteredPlaces.length === 0 && (
              <div className="empty-results-box paper-sheet">
                <p>No places match "{searchQuery}".</p>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Reset search filter
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Bottom Section: Community Post Feed */}
      {(activeTab === 'all' || activeTab === 'community') && (
        <section className="explore-community-feed-section" aria-label="Community trip itineraries">
          <div className="explore-section-heading">
            <div className="heading-title-group">
              <span>COMMUNITY TRIP FEED</span>
              <small>Shared travel notebooks</small>
            </div>
            <span className="community-shared-badge">Explicitly shared</span>
          </div>

          <div className="community-trip-feed">
            {filteredCommunityTrips.map(trip => (
              <CommunityTripCard
                key={trip.id}
                trip={trip}
                onToggleSave={onToggleSaveCommunityTrip}
                onViewPlan={setSelectedPlanModal}
              />
            ))}
            {filteredCommunityTrips.length === 0 && (
              <div className="empty-results-box paper-sheet">
                <p>No community trips found for category "{selectedCategory}".</p>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                >
                  Show all trips
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Discovery Lens / Tingo Context */}
      <section className="explore-tingo-lens-section paper-sheet" aria-label="Discovery Lens">
        <div className="lens-header">
          <Sparkles size={16} className="lens-icon" />
          <div className="lens-title-group">
            <h3>Your Discovery Lens</h3>
            <p>Recommendations adapt to your long-term travel profile.</p>
          </div>
        </div>

        <div className="lens-chips-row">
          <span className="lens-chip active">
            {tingoBehavior.recommendationBias} first
          </span>
          <span className="lens-chip">
            {tingoBehavior.itineraryDensity} pace
          </span>
          <span className="lens-chip">
            {tingoBehavior.accommodationBias} stay
          </span>
          <span className="lens-chip">
            {tingoBehavior.changeStyle} changes
          </span>
        </div>
      </section>

      {/* Community Trip Details Page View (from ui/explore-discovery-redesign) */}
      {detail?.kind === 'trip' && (() => {
        const trip = enrichedCommunityTrips.find(t => t.id === detail.item.id) ?? detail.item;
        const heroImage = trip.coverPhoto || getCommunityTripCover(trip.destination, trip.title, trip.category, trip.id);

        const tripHighlights = trip.highlights && trip.highlights.length > 0
          ? trip.highlights
          : ['Tsukiji Outer Market', 'Daikanyama', 'Shimokitazawa'];

        const tripPlaces: TripPlaceItem[] = tripHighlights.map((stopName, i) => {
          const existing = placeRecommendations.find(
            p => p.name.toLowerCase() === stopName.toLowerCase() || p.name.toLowerCase().includes(stopName.toLowerCase())
          );
          if (existing) {
            return {
              id: existing.id,
              name: existing.name,
              type: existing.type,
              match: existing.match,
              cost: existing.cost,
              duration: existing.duration,
              why: existing.why,
              saved: existing.saved,
              added: existing.added,
              photoUrl: existing.photoUrl || getPlacePhoto(existing.name, existing.type),
            };
          }
          return {
            id: 9000 + trip.id * 10 + i,
            name: stopName,
            type: i === 0 ? 'Food · Market' : i === 1 ? 'Café & Streets' : 'Culture & Neighborhood',
            match: Math.max(78, trip.match - i * 3),
            duration: '1.5 - 2 hrs',
            cost: 'RM 35 est.',
            why: `Carefully picked highlight from ${trip.author}'s journey through ${trip.destination || 'the city'}.`,
            saved: savedIdeas.some(s => s.name.toLowerCase() === stopName.toLowerCase()),
            added: false,
            photoUrl: getStopThumbnail(stopName),
          };
        });

        return (
          <div
            className="xr-fullscreen xr-detail"
            role="dialog"
            aria-modal="true"
            aria-label={`${trip.title} details`}
          >
            <div className="xr-detail-hero xr-trip-hero">
              <img
                src={heroImage}
                alt={trip.title}
                onError={(e) => {
                  e.currentTarget.src = getCommunityTripCover(trip.destination, trip.title, trip.category, trip.id);
                }}
              />
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="Back to explore feed"
                title="Back"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className={trip.saved ? 'saved' : ''}
                onClick={() => {
                  onToggleSaveCommunityTrip(trip.id);
                  setToast(trip.saved ? 'Removed from saved' : 'Trip inspiration saved');
                }}
                aria-label={trip.saved ? 'Remove saved trip' : 'Save trip inspiration'}
                title={trip.saved ? 'Saved' : 'Save'}
              >
                <Heart size={20} fill={trip.saved ? 'currentColor' : 'none'} />
              </button>
              <strong>{trip.title}</strong>
            </div>

            <div className="xr-detail-body">
              <div className="xr-author">
                <span>{trip.authorAvatar ? <img src={trip.authorAvatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} /> : '👩🏻'}</span>
                <div>
                  <b>{trip.author}</b>
                  <small>Public trip · shared by traveller</small>
                </div>
                <button
                  type="button"
                  className={followingAuthors[trip.author] ? 'following' : ''}
                  onClick={() => toggleFollowAuthor(trip.author)}
                >
                  {followingAuthors[trip.author] ? 'Following' : 'Follow'}
                </button>
              </div>

              <p>{trip.description}</p>

              <div className="xr-trip-meta">
                <span>{trip.days ?? 4} days</span>
                <span>{trip.places ?? trip.stopsCount ?? tripPlaces.length} places</span>
                <span>Budget-friendly</span>
                <span>Cafés</span>
                <span>Local</span>
              </div>

              <h3>Places in this trip</h3>
              <div className="xr-trip-places">
                {tripPlaces.slice(0, 3).map((place, i) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setDetail({ kind: 'place', item: place, returnToTrip: trip })}
                    aria-label={`View details for ${place.name}`}
                  >
                    <img
                      src={place.photoUrl || getStopThumbnail(place.name)}
                      alt={place.name}
                      onError={(e) => {
                        e.currentTarget.src = getStopThumbnail(place.name);
                      }}
                    />
                    <b>{i + 1}. {place.name}</b>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`xr-save-trip ${trip.saved ? 'saved' : ''}`}
                onClick={() => {
                  onToggleSaveCommunityTrip(trip.id);
                  setToast(trip.saved ? 'Removed from saved' : 'Trip inspiration saved');
                }}
              >
                {trip.saved ? '✓ Trip inspiration saved' : 'Save trip inspiration'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Place Inspection Sub-view (when a user clicks a place within a trip) */}
      {detail?.kind === 'place' && (() => {
        const place = detail.item;
        const returnTrip = detail.returnToTrip;
        const placePhoto = place.photoUrl || getStopThumbnail(place.name);
        const dest = selectedDestination || activeTripDestination || 'Tokyo';

        return (
          <div
            className="xr-fullscreen xr-detail"
            role="dialog"
            aria-modal="true"
            aria-label={`${place.name} details`}
          >
            <div className="xr-detail-hero">
              <img
                src={placePhoto}
                alt={place.name}
                onError={(e) => {
                  e.currentTarget.src = getStopThumbnail(place.name);
                }}
              />
              <button
                type="button"
                onClick={() => setDetail(returnTrip ? { kind: 'trip', item: returnTrip } : null)}
                aria-label={returnTrip ? 'Back to trip' : 'Close'}
                title="Back"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className={place.saved ? 'saved' : ''}
                onClick={() => {
                  onSavePlace(place.id);
                  setDetail(curr => curr?.kind === 'place' ? { ...curr, item: { ...curr.item, saved: !curr.item.saved } } : curr);
                  setToast(place.saved ? 'Removed from saved' : 'Saved to ideas!');
                }}
                aria-label={place.saved ? 'Remove saved place' : 'Save place'}
                title={place.saved ? 'Saved' : 'Save'}
              >
                <Heart size={20} fill={place.saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="xr-detail-body">
              <h2>{place.name}</h2>
              <p>{place.type} · {dest}</p>

              <div className="xr-match">
                ♥ {place.match}% match for your group <span>👩🏻‍🦰👩🏻👩🏻‍🦱</span>
              </div>

              <h3>Why this fits your trip</h3>
              <ul>
                <li><Heart size={16} />Matches your café / food preferences</li>
                <li><Clock size={16} />Fits your {place.duration || '1.5 - 2 hrs'} window</li>
                <li><Wallet size={16} />Within your current budget style ({place.cost || 'moderate'})</li>
                <li><Users size={16} />Works with the group’s shared signals</li>
                <li><CloudRain size={16} />Good flexible stop if plans change</li>
              </ul>

              <blockquote>
                “{place.why || 'A wonderful stop carefully matched with your travel profile.'}”
                <small>— Coco</small>
              </blockquote>

              <div className="xr-detail-actions">
                <button
                  type="button"
                  onClick={() => {
                    onSavePlace(place.id);
                    setDetail(curr => curr?.kind === 'place' ? { ...curr, item: { ...curr.item, saved: !curr.item.saved } } : curr);
                    setToast(place.saved ? 'Removed from saved' : 'Saved to ideas!');
                  }}
                  className={place.saved ? 'saved' : ''}
                >
                  <Bookmark size={16} fill={place.saved ? 'currentColor' : 'none'} />
                  <span>{place.saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  className={place.added ? 'suggested' : 'primary'}
                  onClick={() => {
                    onAddPlace(place.id);
                    setDetail(curr => curr?.kind === 'place' ? { ...curr, item: { ...curr.item, added: !curr.item.added } } : curr);
                    setToast(place.added ? 'Removed from suggestions' : 'Suggested to group!');
                  }}
                >
                  <Send size={16} />
                  <span>{place.added ? 'Suggested to group' : 'Suggest to group'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Feedback Notification */}
      {toast && (
        <div className="xr-toast" role="status" aria-live="polite">
          ✓ {toast}
        </div>
      )}
    </div>
  );
};
export default ExploreScreen;
