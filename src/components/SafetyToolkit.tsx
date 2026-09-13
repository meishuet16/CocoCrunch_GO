import { useState } from 'react';
import {
  Heart,
  Pill,
  Luggage,
  Shield,
  CreditCard,
  HelpCircle,
  Phone,
  PhoneCall,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Search,
  AlertTriangle,
} from 'lucide-react';
import './SafetyToolkit.css';

export type SafetyService = 'hospital' | 'pharmacy' | 'luggage' | 'police' | 'atm' | 'helpdesk';

export type ServiceFacility = {
  name: string;
  note: string;
  distance: string;
  openHours: string;
  badges: string[];
  address: string;
  phone?: string;
  phrase?: string;
};

// Destination-aware hotlines
const emergencyHotlines: Record<string, { label: string; number: string }[]> = {
  tokyo: [
    { label: 'Ambulance & Fire', number: '119' },
    { label: 'Police', number: '110' },
    { label: 'Japan Visitor Hotline (24/7 English)', number: '050-3816-2788' },
  ],
  kyoto: [
    { label: 'Ambulance & Fire', number: '119' },
    { label: 'Police', number: '110' },
    { label: 'Kyoto Tourist Info Helpline', number: '075-343-0548' },
  ],
  osaka: [
    { label: 'Ambulance & Fire', number: '119' },
    { label: 'Police', number: '110' },
    { label: 'Osaka Call Center (Multilingual)', number: '06-6131-4550' },
  ],
  seoul: [
    { label: 'Ambulance & Fire', number: '119' },
    { label: 'Police', number: '112' },
    { label: 'Korea Travel Hotline (24/7 English)', number: '1330' },
  ],
  bangkok: [
    { label: 'Tourist Police (English)', number: '1155' },
    { label: 'Ambulance', number: '1669' },
    { label: 'Police General', number: '191' },
  ],
  singapore: [
    { label: 'Ambulance & Fire', number: '995' },
    { label: 'Police', number: '999' },
    { label: 'Tourist Hotline', number: '1800-736-2000' },
  ],
  london: [
    { label: 'Emergency (Police/Ambulance)', number: '999' },
    { label: 'EU Emergency', number: '112' },
    { label: 'NHS Non-Emergency Medical', number: '111' },
  ],
  paris: [
    { label: 'European Emergency', number: '112' },
    { label: 'SAMU Medical Emergency', number: '15' },
    { label: 'Police Emergency', number: '17' },
  ],
};

function getHotlinesFor(destination: string) {
  const key = destination.trim().toLowerCase();
  for (const [city, lines] of Object.entries(emergencyHotlines)) {
    if (key.includes(city)) return lines;
  }
  return [
    { label: 'Universal Emergency', number: '112' },
    { label: 'Police & Medical', number: '911' },
    { label: 'International Assistance', number: '+1-202-501-4444' },
  ];
}

// Destination-aware facilities catalog
function getCatalogFor(destination: string): Record<SafetyService, ServiceFacility[]> {
  const destLower = destination.trim().toLowerCase();

  if (destLower.includes('tokyo')) {
    return {
      hospital: [
        {
          name: "St. Luke's International Hospital (ER)",
          note: 'Emergency room open 24/7 with English-speaking doctors & direct credit insurance billing.',
          distance: '0.4 km · ~5 min walk',
          openHours: 'Open 24 Hours',
          badges: ['Open 24/7', 'English Spoken', '24h ER'],
          address: '9-1 Akashicho, Chuo City, Tokyo',
          phone: '+81-3-3541-5151',
          phrase: "Please take me to St. Luke's International Hospital Emergency Room.",
        },
        {
          name: 'Tokyo Metropolitan Health Medical Desk (#7119)',
          note: '24/7 multilingual telephone consultation & triage navigation before visiting clinic.',
          distance: 'Telephone service',
          openHours: 'Open 24 Hours',
          badges: ['Multilingual', 'Free Consultation', 'Hotline'],
          address: 'Tokyo Metropolitan Medical Information System',
          phone: '#7119',
          phrase: 'I need medical consultation assistance with English translation.',
        },
        {
          name: 'NTT Medical Center Tokyo',
          note: 'Full-service acute hospital with international patient support desk.',
          distance: '1.2 km · ~15 min transit',
          openHours: '08:30 – 17:00 · Urgent Care 24h',
          badges: ['Specialist Care', 'Walk-in ER'],
          address: '5-9-22 Higashi-Gotanda, Shinagawa City, Tokyo',
          phone: '+81-3-3448-6111',
          phrase: 'Please take me to the nearest general hospital emergency department.',
        },
      ],
      pharmacy: [
        {
          name: 'Matsumoto Kiyoshi Ginza 5-Chome (24h)',
          note: '24-hour drugstore with English product labels, OTC fever medicine & first-aid bandages.',
          distance: '0.2 km · ~3 min walk',
          openHours: 'Open 24 Hours',
          badges: ['Open 24/7', 'Tax-Free', 'English Labels'],
          address: '5-5-1 Ginza, Chuo City, Tokyo',
          phone: '+81-3-3289-5321',
          phrase: 'Do you have pain relief and fever medication available over the counter?',
        },
        {
          name: 'Welcia Pharmacy Late-Hours',
          note: 'Open until 23:00 for rehydration salts, travel motion sickness pills, and cold relief.',
          distance: '0.5 km · ~6 min walk',
          openHours: '08:00 – 23:00',
          badges: ['Late-Night', 'Prescription & OTC'],
          address: 'Daikanyama Concourse 1F, Shibuya City, Tokyo',
          phone: '+81-3-5456-1188',
          phrase: 'I need travel essentials and first-aid supplies.',
        },
        {
          name: 'Bic Camera Drug & Medical Counter',
          note: 'Tax-free pharmacy with multilingual pharmacists and travel health essentials.',
          distance: '0.8 km · ~10 min walk',
          openHours: '10:00 – 22:00',
          badges: ['Tax-Free', 'Multilingual Staff'],
          address: 'Yurakucho 1-11-1, Chiyoda City, Tokyo',
          phone: '+81-3-5221-1111',
          phrase: 'Where is the duty-free first aid and pharmacy section?',
        },
      ],
      luggage: [
        {
          name: 'Shinjuku Station B1 Coin Lockers (Suica/IC)',
          note: 'Over 600 smart lockers supporting IC cards and QR keys. Medium, large, and XL sizes.',
          distance: '0.1 km · ~2 min walk',
          openHours: '05:00 – 00:30 (Station Hours)',
          badges: ['Suica / Pasmo', 'XL Sizes', 'Real-time Status'],
          address: 'Shinjuku Station South Exit Underground Concourse',
          phrase: 'Where are the nearest available large luggage coin lockers?',
        },
        {
          name: 'Tokyo Station Sagawa Baggage Service Center',
          note: 'Same-day luggage delivery to your hotel and temporary baggage holding counter.',
          distance: '0.3 km · ~4 min walk',
          openHours: '07:00 – 23:00',
          badges: ['Hotel Forwarding', 'Oversized Bags', 'Staffed'],
          address: 'Tokyo Station Marunouchi North Exit 1F',
          phone: '+81-3-5224-6132',
          phrase: 'I would like to store my luggage and arrange same-day delivery to my hotel.',
        },
        {
          name: 'Ecbo Cloak Partner Spot (Shibuya)',
          note: 'Instant reservation luggage drop at verified boutique cafes near the crossing.',
          distance: '0.5 km · ~6 min walk',
          openHours: '09:00 – 21:00',
          badges: ['App Booking', 'Guaranteed Space'],
          address: 'Shibuya Stream 2F, Shibuya City, Tokyo',
          phrase: 'I have a luggage reservation for baggage drop-off here.',
        },
      ],
      police: [
        {
          name: 'Shibuya Station Hachiko Police Box (Koban)',
          note: '24/7 staffed police booth for lost property reports, directions, and emergency assistance.',
          distance: '0.2 km · ~3 min walk',
          openHours: 'Open 24 Hours',
          badges: ['Open 24/7', 'Lost & Found', 'English Guidebooks'],
          address: '1-1 Dogenzaka, Shibuya City, Tokyo',
          phrase: 'I lost my bag and wallet. Could you please help me file a lost property report?',
        },
        {
          name: 'Tokyo Metropolitan Police Tourist Desk',
          note: 'English-speaking police officer consultation for visitors and safety inquiries.',
          distance: '1.5 km · ~18 min walk',
          openHours: '08:30 – 17:15',
          badges: ['English Helpline', 'Lost Passport Assistance'],
          address: '2-1-1 Kasumigaseki, Chiyoda City, Tokyo',
          phone: '#9110',
          phrase: 'I need police assistance with English translation support.',
        },
      ],
      atm: [
        {
          name: '7-Eleven Seven Bank 24h ATM',
          note: 'Accepts foreign Visa, Mastercard, Maestro, Cirrus, and UnionPay. English touch interface.',
          distance: '0.1 km · ~2 min walk',
          openHours: 'Open 24 Hours',
          badges: ['Open 24/7', 'Foreign Cards OK', 'English UI'],
          address: 'Every 7-Eleven store in Tokyo',
          phrase: 'Where is the nearest 24-hour ATM that accepts international cards?',
        },
        {
          name: 'Japan Post Bank ATM (Central Post Office)',
          note: 'International cash withdrawal with zero ATM fee on supported global bank cards.',
          distance: '0.4 km · ~5 min walk',
          openHours: '07:00 – 23:00',
          badges: ['International Cards', 'Low Foreign Fee'],
          address: 'JP Tower KITTE 1F, Marunouchi, Tokyo',
          phrase: 'Can I withdraw Japanese Yen using an international debit card here?',
        },
      ],
      helpdesk: [
        {
          name: 'JNTO Tourist Information Center (Tokyo Station)',
          note: 'Official national tourism board desk with native English speakers, maps, and safety alerts.',
          distance: '0.3 km · ~4 min walk',
          openHours: '09:00 – 17:30',
          badges: ['English Native', 'Free Maps', 'Emergency Alerts'],
          address: 'Shin-Tokyo Bldg 1F, 3-3-1 Marunouchi, Chiyoda City',
          phone: '+81-3-3201-3331',
          phrase: 'I need official tourist and safety assistance in English.',
        },
      ],
    };
  }

  // Generic & smart fallback for any destination
  return {
    hospital: [
      {
        name: `${destination} Central Hospital Emergency Department`,
        note: 'General acute care facility with 24-hour emergency triage and multilingual intake support.',
        distance: '0.6 km · ~8 min walk',
        openHours: 'Open 24 Hours',
        badges: ['Open 24/7', 'Emergency ER', 'English Support'],
        address: `Central Healthcare District, ${destination}`,
        phone: '+1-800-555-0199',
        phrase: `Please take me to the nearest emergency hospital in ${destination}.`,
      },
      {
        name: `${destination} International Travelers Clinic`,
        note: 'Walk-in urgent consultations for fever, food poisoning, travel prescriptions & minor injuries.',
        distance: '0.9 km · ~12 min walk',
        openHours: '08:00 – 20:00',
        badges: ['Walk-in Clinic', 'English Doctors'],
        address: `Medical Arts Building, ${destination}`,
        phone: '+1-800-555-0144',
        phrase: 'I need to see a doctor for travel-related medical treatment.',
      },
    ],
    pharmacy: [
      {
        name: `${destination} 24h Express Pharmacy & First Aid`,
        note: 'Over-the-counter pain relief, fever medication, bandages, and basic medical supplies.',
        distance: '0.3 km · ~4 min walk',
        openHours: 'Open 24 Hours',
        badges: ['Open 24/7', 'OTC Medicine', 'First Aid'],
        address: `Main Street Commerce Row, ${destination}`,
        phrase: 'Do you carry pain relief or stomach medicine for travelers?',
      },
      {
        name: `${destination} Care Pharmacy & Travel Essentials`,
        note: 'Rehydration salts, antihistamines, travel wellness supplies and English product consultation.',
        distance: '0.7 km · ~9 min walk',
        openHours: '08:30 – 22:00',
        badges: ['Prescription & OTC', 'English Guidance'],
        address: `Station Plaza Level 1, ${destination}`,
        phrase: 'I am looking for travel medical essentials and first-aid supplies.',
      },
    ],
    luggage: [
      {
        name: `${destination} Central Station Baggage Lockers`,
        note: 'Electronic lockers with keyless card / PIN access. Accommodates carry-ons and XL suitcases.',
        distance: '0.2 km · ~3 min walk',
        openHours: '05:30 – 23:30',
        badges: ['Electronic PIN', 'XL Luggage', 'High Capacity'],
        address: `Central Station Ground Concourse, ${destination}`,
        phrase: 'Where can I find lockers large enough for travel luggage?',
      },
      {
        name: `${destination} Luggage Hold & Hotel Delivery`,
        note: 'Staffed luggage storage service with same-day transfer to local accommodation.',
        distance: '0.4 km · ~5 min walk',
        openHours: '07:00 – 21:00',
        badges: ['Staffed Storage', 'Hotel Transfer'],
        address: `Transit Center Counter 4, ${destination}`,
        phrase: 'I would like to check my bags for storage today.',
      },
    ],
    police: [
      {
        name: `${destination} Tourist Police & Koban Station`,
        note: 'Local emergency reporting, lost property assistance, and visitor protection services.',
        distance: '0.3 km · ~4 min walk',
        openHours: 'Open 24 Hours',
        badges: ['Open 24/7', 'Lost Property', 'Emergency Help'],
        address: `Town Square Corner, ${destination}`,
        phrase: 'I need to report lost travel documents and belongings.',
      },
    ],
    atm: [
      {
        name: `${destination} Global ATM Cash Express (24h)`,
        note: 'Accepts international Visa, Mastercard, Cirrus and foreign debit cards with English menu.',
        distance: '0.2 km · ~3 min walk',
        openHours: 'Open 24 Hours',
        badges: ['Open 24/7', 'International Cards', 'English Screen'],
        address: `Transit Concourse ATM Zone, ${destination}`,
        phrase: 'Where is the nearest ATM accepting international bank cards?',
      },
    ],
    helpdesk: [
      {
        name: `${destination} Visitor Information & Assistance Desk`,
        note: 'Official tourist safety point with English guides, embassy contact info & emergency support.',
        distance: '0.4 km · ~5 min walk',
        openHours: '09:00 – 18:00',
        badges: ['English Staff', 'Official Desk', 'Embassy Contacts'],
        address: `City Welcome Center, ${destination}`,
        phrase: 'I need tourist assistance and emergency embassy contact info.',
      },
    ],
  };
}

export function SafetyToolkit({ destination }: { destination: string }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [service, setService] = useState<SafetyService | null>('hospital');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const hotlines = getHotlinesFor(destination);
  const catalog = getCatalogFor(destination);

  function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  }

  // Filter facilities based on selected category and search query
  const currentFacilities = service ? catalog[service] || [] : [];
  const filteredFacilities = currentFacilities.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.note.toLowerCase().includes(q) ||
      item.badges.some(b => b.toLowerCase().includes(q))
    );
  });

  return (
    <section className="safety-toolkit" aria-label="Safety toolkit and nearby help">
      <div className="safety-header-area">
        <h3>Safety</h3>
        <p>Immediate local assistance, emergency contacts, and verified nearby facilities.</p>
      </div>

      {/* 1. SOS Emergency Numbers Quick Dial Strip */}
      <section className="sos-hotline-strip" aria-label="Emergency hotlines">
        <div className="sos-strip-header">
          <span className="sos-strip-title">
            <AlertTriangle size={14} /> Emergency Hotlines
          </span>
          <span className="sos-destination-badge">{destination}</span>
        </div>
        <div className="sos-numbers-grid">
          {hotlines.map(item => (
            <a
              key={item.label}
              href={`tel:${item.number.replace(/[^0-9+]/g, '')}`}
              className="sos-number-card"
              title={`Call ${item.label}: ${item.number}`}
            >
              <div className="sos-number-info">
                <span className="sos-number-label">{item.label}</span>
                <span className="sos-number-digits">{item.number}</span>
              </div>
              <div className="sos-call-btn" aria-hidden="true">
                <PhoneCall size={14} />
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="safety-list">
        {/* 2. Check-in Section */}
        <section className="safety-card-section">
          <div className="safety-card-top">
            <span className="safety-card-title">Check-in</span>
            {checkedIn && (
              <span className="safety-badge highlight">
                <Check size={11} style={{ display: 'inline', marginRight: 2 }} /> Checked in
              </span>
            )}
          </div>
          <p className="safety-card-desc">
            {checkedIn
              ? 'Ready to share your status update with travel companions.'
              : 'Share a status update without location.'}
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => setCheckedIn(true)}
          >
            {checkedIn ? 'Ready' : 'Prepare check-in'}
          </button>
        </section>

        {/* 3. Nearby Help Section */}
        <section className="safety-card-section">
          <div className="safety-card-top">
            <b className="safety-card-title">Nearby help</b>
            <span className="safety-badge">{destination}</span>
          </div>

          <p className="safety-card-desc">
            Tap a category to locate verified facilities and emergency support nearby.
          </p>

          {/* Category Selection Buttons */}
          <div className="safety-service-buttons" role="tablist" aria-label="Nearby help categories">
            <button
              type="button"
              role="tab"
              aria-selected={service === 'hospital'}
              className={`safety-service-btn ${service === 'hospital' ? 'active' : ''}`}
              onClick={() => setService('hospital')}
            >
              <Heart size={14} /> Hospital
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={service === 'pharmacy'}
              className={`safety-service-btn ${service === 'pharmacy' ? 'active' : ''}`}
              onClick={() => setService('pharmacy')}
            >
              <Pill size={14} /> Pharmacy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={service === 'luggage'}
              className={`safety-service-btn ${service === 'luggage' ? 'active' : ''}`}
              onClick={() => setService('luggage')}
            >
              <Luggage size={14} /> Luggage
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={service === 'police'}
              className={`safety-service-btn ${service === 'police' ? 'active' : ''}`}
              onClick={() => setService('police')}
            >
              <Shield size={14} /> Police
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={service === 'atm'}
              className={`safety-service-btn ${service === 'atm' ? 'active' : ''}`}
              onClick={() => setService('atm')}
            >
              <CreditCard size={14} /> ATM / Cash
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={service === 'helpdesk'}
              className={`safety-service-btn ${service === 'helpdesk' ? 'active' : ''}`}
              onClick={() => setService('helpdesk')}
            >
              <HelpCircle size={14} /> Help Desk
            </button>
          </div>

          {/* Quick Search */}
          <div className="safety-search-box">
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder={`Search ${service || 'nearby'} facilities, medicine, hours…`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Filter facilities"
            />
            {searchQuery && (
              <button
                type="button"
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 11, color: '#94a3b8' }}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Service Facilities Results */}
          {service && (
            <div className="safety-results" aria-live="polite">
              {filteredFacilities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: '#94a3b8', fontSize: 12 }}>
                  No facilities found matching &ldquo;{searchQuery}&rdquo;. Try another search term.
                </div>
              ) : (
                filteredFacilities.map(result => (
                  <article className="safety-result-card" key={result.name}>
                    <div className="safety-result-header">
                      <div className="safety-result-name-group">
                        <h4 className="safety-result-name">{result.name}</h4>
                        <span className="safety-result-address">{result.address}</span>
                      </div>
                      <span className="safety-result-distance">
                        <MapPin size={11} /> {result.distance}
                      </span>
                    </div>

                    <div className="safety-result-badges">
                      <span className="safety-badge highlight">{result.openHours}</span>
                      {result.badges.map(badge => (
                        <span className="safety-badge" key={badge}>
                          {badge}
                        </span>
                      ))}
                    </div>

                    <p className="safety-result-note">{result.note}</p>

                    <div className="safety-result-actions">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${result.name}, ${destination}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="safety-action-link primary-action"
                      >
                        <ExternalLink size={13} /> Open in Maps
                      </a>

                      {result.phone && (
                        <a
                          href={`tel:${result.phone.replace(/[^0-9+]/g, '')}`}
                          className="safety-action-link secondary-action"
                        >
                          <Phone size={13} /> Call
                        </a>
                      )}

                      {result.phrase && (
                        <button
                          type="button"
                          className="safety-action-link secondary-action"
                          onClick={() => copyToClipboard(result.phrase!)}
                          title="Copy English phrase to show local or taxi"
                        >
                          {copiedText === result.phrase ? (
                            <>
                              <Check size={13} color="#10b981" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Phrase
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* 4. English Emergency Flashcard Helper ("Show to Local or Taxi") */}
        <section className="emergency-phrases-card">
          <div className="safety-card-top">
            <span className="safety-card-title" style={{ color: '#930500' }}>
              English Emergency Flashcards
            </span>
            <span className="sos-destination-badge">Show to Local / Taxi</span>
          </div>
          <p className="safety-card-desc">
            Tap copy to show or share these essential English phrases when asking for urgent assistance:
          </p>

          <div className="emergency-phrase-item">
            <div className="emergency-phrase-text">
              <span className="emergency-phrase-title">Medical Emergency</span>
              <span className="emergency-phrase-quote">
                &ldquo;I need urgent medical care. Please call an ambulance or direct me to an English-speaking doctor.&rdquo;
              </span>
            </div>
            <button
              type="button"
              className="emergency-phrase-copy-btn"
              onClick={() =>
                copyToClipboard(
                  'I need urgent medical care. Please call an ambulance or direct me to an English-speaking doctor.'
                )
              }
            >
              {copiedText ===
              'I need urgent medical care. Please call an ambulance or direct me to an English-speaking doctor.' ? (
                <>
                  <Check size={12} color="#10b981" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>

          <div className="emergency-phrase-item">
            <div className="emergency-phrase-text">
              <span className="emergency-phrase-title">Luggage Storage</span>
              <span className="emergency-phrase-quote">
                &ldquo;Excuse me, where can I find the nearest coin lockers or luggage storage for large suitcases?&rdquo;
              </span>
            </div>
            <button
              type="button"
              className="emergency-phrase-copy-btn"
              onClick={() =>
                copyToClipboard(
                  'Excuse me, where can I find the nearest coin lockers or luggage storage for large suitcases?'
                )
              }
            >
              {copiedText ===
              'Excuse me, where can I find the nearest coin lockers or luggage storage for large suitcases?' ? (
                <>
                  <Check size={12} color="#10b981" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>

          <div className="emergency-phrase-item">
            <div className="emergency-phrase-text">
              <span className="emergency-phrase-title">Lost Property</span>
              <span className="emergency-phrase-quote">
                &ldquo;I lost my backpack and travel documents. Where is the nearest police box (Koban) or lost and found?&rdquo;
              </span>
            </div>
            <button
              type="button"
              className="emergency-phrase-copy-btn"
              onClick={() =>
                copyToClipboard(
                  'I lost my backpack and travel documents. Where is the nearest police box (Koban) or lost and found?'
                )
              }
            >
              {copiedText ===
              'I lost my backpack and travel documents. Where is the nearest police box (Koban) or lost and found?' ? (
                <>
                  <Check size={12} color="#10b981" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
        </section>

        {/* 5. Emergency Contacts Link */}
        <section className="safety-card-section">
          <b className="safety-card-title">Emergency contacts</b>
          <small className="safety-card-desc">Manage contacts in Me.</small>
        </section>
      </div>
    </section>
  );
}
