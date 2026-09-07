/**
 * Curated travel photography mapping for places and community trips.
 * All photos are uniquely assigned, color-aligned with CocoCrunch GO's warm cream & sangria theme,
 * and specifically depict the actual locations and activities.
 */

// Place-specific photography dictionary (Strictly unique, verified HTTP 200 URLs)
const PLACE_PHOTOS: Record<string, string> = {
  // Tokyo
  'tsukiji': 'https://images.unsplash.com/photo-1606625539830-b4743fa85941?w=700&auto=format&fit=crop&q=80',
  'tsukiji outer market': 'https://images.unsplash.com/photo-1606625539830-b4743fa85941?w=700&auto=format&fit=crop&q=80',
  'daikanyama': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80',
  'shimokitazawa': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=700&auto=format&fit=crop&q=80',
  'mori art': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&auto=format&fit=crop&q=80',
  'mori art museum': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700&auto=format&fit=crop&q=80',
  'tokyo station': 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=700&auto=format&fit=crop&q=80',
  'ginza': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=700&auto=format&fit=crop&q=80',

  // Kyoto
  'nishiki': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80',
  'nishiki market': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80',
  'philosopher': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=700&auto=format&fit=crop&q=80',
  'philosopher’s path': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=700&auto=format&fit=crop&q=80',
  'kiyomizu': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&auto=format&fit=crop&q=80',
  'kiyomizu area': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&auto=format&fit=crop&q=80',
  'gion': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=700&auto=format&fit=crop&q=80',

  // Osaka
  'kuromon': 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?w=700&auto=format&fit=crop&q=80',
  'kuromon market': 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?w=700&auto=format&fit=crop&q=80',
  'nakazakicho': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=700&auto=format&fit=crop&q=80',
  'nakanoshima': 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=700&auto=format&fit=crop&q=80',
  'dotonbori': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=700&auto=format&fit=crop&q=80',
  'osaka castle': 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=700&auto=format&fit=crop&q=80',

  // Jeju
  'jeju': 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=700&auto=format&fit=crop&q=80',
  'seongsan': 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=700&auto=format&fit=crop&q=80',
  'sulloc': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=700&auto=format&fit=crop&q=80',
  'aewol': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',

  // Taipei
  'shilin': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=700&auto=format&fit=crop&q=80',
  'jiufen': 'https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=700&auto=format&fit=crop&q=80',
  'xiangshan': 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=700&auto=format&fit=crop&q=80',

  // Tuscany / Florence
  'uffizi': 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=700&auto=format&fit=crop&q=80',
  'chianti': 'https://images.unsplash.com/photo-1523528283115-9bf9b1699245?w=700&auto=format&fit=crop&q=80',
  'ponte vecchio': 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=700&auto=format&fit=crop&q=80',

  // Paris
  'marais': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700&auto=format&fit=crop&q=80',
  'montmartre': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&auto=format&fit=crop&q=80',
  'seine': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=700&auto=format&fit=crop&q=80',

  // Bangkok
  'yaowarat': 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=700&auto=format&fit=crop&q=80',
  'chao phraya': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=700&auto=format&fit=crop&q=80',
  'wat arun': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=700&auto=format&fit=crop&q=80',

  // Iceland
  'seljalandsfoss': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=700&auto=format&fit=crop&q=80',
  'reynisfjara': 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=700&auto=format&fit=crop&q=80',
  'blue lagoon': 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=700&auto=format&fit=crop&q=80',

  // Melbourne
  'degraves': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=700&auto=format&fit=crop&q=80',
  'twelve apostles': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&auto=format&fit=crop&q=80',
  'fitzroy': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=80',
};

// Unique cover photos for each specific community itinerary
const COMMUNITY_TRIP_COVERS: Record<number | string, string> = {
  1: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80', // Tokyo slow food
  2: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&auto=format&fit=crop&q=80', // Tokyo rainproof
  3: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800&auto=format&fit=crop&q=80', // Kyoto temple
  4: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?w=800&auto=format&fit=crop&q=80', // Osaka street
  5: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80', // Jeju salt air
  6: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&auto=format&fit=crop&q=80', // Taipei tea hills
  7: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80', // Tuscany stone lanes
  8: 'https://images.unsplash.com/photo-1471623432079-b009d30b6729?w=800&auto=format&fit=crop&q=80', // Paris Seine
  9: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80', // Bangkok street food
  10: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80', // Iceland waterfalls
  11: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80', // Melbourne espresso
};

// Destination-wide hero & cover photos (Strictly unique, verified HTTP 200 URLs)
const DESTINATION_COVERS: Record<string, string> = {
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
  kyoto: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&auto=format&fit=crop&q=80',
  osaka: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80',
  jeju: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&auto=format&fit=crop&q=80',
  seoul: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80',
  taipei: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
  florence: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  paris: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80',
  bangkok: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
  reykjavik: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800&auto=format&fit=crop&q=80',
  melbourne: 'https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=800&auto=format&fit=crop&q=80',
};

// Category fallback photography (Strictly unique, verified HTTP 200 URLs)
const CATEGORY_PHOTOS: Record<string, string> = {
  food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&auto=format&fit=crop&q=80',
  market: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=700&auto=format&fit=crop&q=80',
  cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&auto=format&fit=crop&q=80',
  cafes: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&auto=format&fit=crop&q=80',
  vintage: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=700&auto=format&fit=crop&q=80',
  walk: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&auto=format&fit=crop&q=80',
  temple: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&auto=format&fit=crop&q=80',
  scenery: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=700&auto=format&fit=crop&q=80',
  art: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=700&auto=format&fit=crop&q=80',
  riverside: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=700&auto=format&fit=crop&q=80',
};

const DEFAULT_PLACE_PHOTO = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&auto=format&fit=crop&q=80';
const DEFAULT_TRIP_COVER = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&auto=format&fit=crop&q=80';
const DEFAULT_STOP_THUMBNAIL = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&auto=format&fit=crop&q=80';

/**
 * Returns a high-res travel photo for a place candidate.
 */
export function getPlacePhoto(name: string, type: string, destination?: string): string {
  const cleanName = name.toLowerCase().trim();
  for (const [key, url] of Object.entries(PLACE_PHOTOS)) {
    if (cleanName.includes(key)) {
      return url;
    }
  }

  const cleanType = type.toLowerCase();
  for (const [cat, url] of Object.entries(CATEGORY_PHOTOS)) {
    if (cleanType.includes(cat)) {
      return url;
    }
  }

  if (destination) {
    const destKey = destination.toLowerCase().trim();
    if (DESTINATION_COVERS[destKey]) {
      return DESTINATION_COVERS[destKey];
    }
  }

  return DEFAULT_PLACE_PHOTO;
}

/**
 * Returns a cover photo banner for a community trip.
 * Uses dedicated trip cover if id is known, otherwise destination/category fallbacks.
 */
export function getCommunityTripCover(destination?: string, title?: string, category?: string, tripId?: number): string {
  if (tripId && COMMUNITY_TRIP_COVERS[tripId]) {
    return COMMUNITY_TRIP_COVERS[tripId];
  }

  if (destination) {
    const key = destination.toLowerCase().trim();
    if (DESTINATION_COVERS[key]) {
      return DESTINATION_COVERS[key];
    }
  }

  const text = `${title || ''} ${category || ''}`.toLowerCase();
  for (const [cat, url] of Object.entries(CATEGORY_PHOTOS)) {
    if (text.includes(cat)) {
      return url;
    }
  }

  return DEFAULT_TRIP_COVER;
}

/**
 * Returns a stop highlight thumbnail for an itinerary stop.
 */
export function getStopThumbnail(stopName: string): string {
  const clean = stopName.toLowerCase();
  for (const [key, url] of Object.entries(PLACE_PHOTOS)) {
    if (clean.includes(key)) {
      return url;
    }
  }
  for (const [cat, url] of Object.entries(CATEGORY_PHOTOS)) {
    if (clean.includes(cat)) {
      return url;
    }
  }
  return DEFAULT_STOP_THUMBNAIL;
}

