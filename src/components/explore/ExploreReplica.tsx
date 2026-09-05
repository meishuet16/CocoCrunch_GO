import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Heart, Search, SlidersHorizontal, X, MapPin, Clock, Users, Wallet, CloudRain, Bookmark, Send } from 'lucide-react';
import { emitExperience } from '../../experience';
import { commitRitualState, loadRitualState } from '../../ritualState';
import { loadPersisted } from '../../persistence';
import { discoverPlaces, type DiscoveryPlace } from '../../domain/discovery';
import { scoreTingo } from '../../domain/tingo';

type FeedMode = 'all' | 'places' | 'trips';
type Place = DiscoveryPlace & { id: number; saved: boolean; suggested: boolean; image: string };
type Trip = { id: number; title: string; author: string; match: number; days: number; places: number; saved: boolean; image: string; description: string };
type Detail = { kind: 'place'; item: Place } | { kind: 'trip'; item: Trip } | null;

const photos = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=82',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=82',
];

const tripSeed: Trip[] = [
  { id: 1, title: 'Tokyo slow food + vintage streets', author: 'Aki', match: 92, days: 5, places: 12, saved: false, image: photos[3], description: 'A five-day trip filled with good food, little shops and unexpected moments. Hope this helps you plan your own Tokyo adventure!' },
  { id: 2, title: 'A rainy day in Tokyo', author: 'Mina', match: 90, days: 3, places: 8, saved: false, image: photos[1], description: 'Rain-friendly cafés, covered streets and a gentler pace for a Tokyo weekend.' },
  { id: 3, title: 'Kyoto café hopping', author: 'Rin', match: 88, days: 2, places: 7, saved: false, image: photos[4], description: 'Quiet cafés, local sweets and small streets worth slowing down for.' },
];

const categories = ['For you', 'Places', 'Trips', 'Cafés', 'Food', 'Nature'];

function updatePersistedRecommendation(name: string, patch: { saved?: boolean; added?: boolean }) {
  try {
    const key = 'cococrunch:v1';
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const current = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    const existing = current.find((item: { name?: string }) => item.name === name);
    parsed.recommendations = existing
      ? current.map((item: { name?: string }) => item.name === name ? { ...item, ...patch } : item)
      : [...current, { name, saved: Boolean(patch.saved), added: Boolean(patch.added) }];
    localStorage.setItem(key, JSON.stringify(parsed));
  } catch { /* persistence is progressive enhancement */ }
}

export default function ExploreReplica() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mode, setMode] = useState<FeedMode>('all');
  const [category, setCategory] = useState('For you');
  const [detail, setDetail] = useState<Detail>(null);
  const [trips, setTrips] = useState(tripSeed);
  const [toast, setToast] = useState<string | null>(null);

  const persisted = useMemo(() => loadPersisted(), []);
  const destination = persisted.destination || persisted.tripIntent?.destination || 'Tokyo';
  const dimensions = useMemo(() => scoreTingo(persisted.tingoAnswers ?? []), [persisted.tingoAnswers]);
  const [places, setPlaces] = useState<Place[]>(() => discoverPlaces(destination, dimensions).slice(0, 6).map((place, index) => ({
    ...place,
    id: index + 1,
    saved: Boolean(persisted.recommendations?.find(item => item.name === place.name)?.saved),
    suggested: Boolean(persisted.recommendations?.find(item => item.name === place.name)?.added),
    image: photos[index % photos.length],
  })));

  useEffect(() => {
    const find = () => setHost(document.querySelector('.explore-screen'));
    find();
    const observer = new MutationObserver(find);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1700);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredPlaces = places.filter(place => !query.trim() || `${place.name} ${place.type} ${place.why}`.toLowerCase().includes(query.toLowerCase()));
  const filteredTrips = trips.filter(trip => !query.trim() || `${trip.title} ${trip.author}`.toLowerCase().includes(query.toLowerCase()));

  function savePlace(place: Place) {
    if (place.saved) {
      setPlaces(items => items.map(item => item.id === place.id ? { ...item, saved: false } : item));
      updatePersistedRecommendation(place.name, { saved: false });
      setToast('Removed from saved');
      return;
    }
    emitExperience({ type: 'capture-place', place: place.name, save: () => {
      const current = loadRitualState();
      const savedIdeas = [...(current.savedIdeas ?? []).filter(item => item.name !== place.name), { name: place.name, source: place.source }];
      if (!commitRitualState({ savedIdeas })) return false;
      setPlaces(items => items.map(item => item.id === place.id ? { ...item, saved: true } : item));
      updatePersistedRecommendation(place.name, { saved: true });
      setToast('Saved!');
      return true;
    }});
  }

  function suggestPlace(place: Place) {
    const next = !place.suggested;
    setPlaces(items => items.map(item => item.id === place.id ? { ...item, suggested: next } : item));
    updatePersistedRecommendation(place.name, { added: next });
    setToast(next ? 'Suggested to group' : 'Suggestion removed');
  }

  function openPlace(place: Place) { setDetail({ kind: 'place', item: place }); }
  function openTrip(trip: Trip) { setDetail({ kind: 'trip', item: trip }); }

  if (!host) return null;

  const ui = <div className="xplore-replica">
    <header className="xr-head"><div><h1>Explore</h1><p>Same places. A more you trip.</p></div><span className="xr-stamp">COCO<br/>PICKS</span></header>

    <button className="xr-searchbar" onClick={() => setSearchOpen(true)}><Search size={17}/><span>{query || 'Search cafés, places, trips...'}</span><SlidersHorizontal size={17}/></button>
    <div className="xr-chips">{categories.map(label => <button key={label} className={category === label ? 'active' : ''} onClick={() => { setCategory(label); setMode(label === 'Places' ? 'places' : label === 'Trips' ? 'trips' : 'all'); }}>{label}</button>)}</div>

    <section className="xr-feature" onClick={() => setSearchOpen(true)}><img src={photos[1]} alt="Tokyo street inspiration"/><div className="xr-feature-copy"><small>COCO FOUND A DETOUR</small><b>Find your next<br/>favourite place.</b></div><span>→</span></section>

    {(mode === 'all' || mode === 'places') && <section className="xr-section"><div className="xr-section-title"><h2>{query ? 'Places for you' : 'Recommended for you'}</h2><button onClick={() => { setMode('places'); setCategory('Places'); }}>See all</button></div><div className="xr-grid">{filteredPlaces.slice(0, mode === 'places' ? 6 : 4).map(place => <article className="xr-card" key={place.id} onClick={() => openPlace(place)}><div className="xr-photo"><img src={place.image} alt=""/><span className="xr-kind">PLACE</span><button className={place.saved ? 'xr-heart saved' : 'xr-heart'} onClick={e => { e.stopPropagation(); savePlace(place); }}><Heart size={17} fill={place.saved ? 'currentColor' : 'none'}/></button></div><div className="xr-card-body"><b>{place.name}</b><small>{place.type} · {place.cost}</small><em>♥ {place.match}% match</em><small><Clock size={12}/> {place.duration}</small></div></article>)}</div></section>}

    {(mode === 'all' || mode === 'trips') && <section className="xr-section"><div className="xr-section-title"><h2>Trips from the community</h2><button onClick={() => { setMode('trips'); setCategory('Trips'); }}>See all</button></div><div className="xr-grid">{filteredTrips.slice(0, mode === 'trips' ? 6 : 2).map(trip => <article className="xr-card xr-trip-card" key={trip.id} onClick={() => openTrip(trip)}><div className="xr-photo"><img src={trip.image} alt=""/><span className="xr-kind">TRIP</span><button className={trip.saved ? 'xr-heart saved' : 'xr-heart'} onClick={e => { e.stopPropagation(); setTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item)); setToast(trip.saved ? 'Removed from saved' : 'Trip inspiration saved'); }}><Heart size={17} fill={trip.saved ? 'currentColor' : 'none'}/></button></div><div className="xr-card-body"><b>{trip.title}</b><small>◉ {trip.author}</small><small>{trip.days} days · {trip.places} places</small><em>♥ {trip.match}% match</em></div></article>)}</div></section>}

    {searchOpen && <div className="xr-fullscreen"><div className="xr-search-top"><button onClick={() => setSearchOpen(false)}><ChevronLeft/></button><label><Search size={17}/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="quiet cafe near shibuya"/>{query && <button onClick={() => setQuery('')}><X size={15}/></button>}</label><button onClick={() => setFiltersOpen(true)}><SlidersHorizontal/></button></div>{!query ? <div className="xr-suggestions"><h3>Try searching</h3>{['quiet cafe near shibuya','cafe with good matcha','hidden gems in tokyo','rainy day indoor activities','brunch near me','local market'].map(text => <button key={text} onClick={() => setQuery(text)}><Search size={15}/>{text}</button>)}<div className="xr-looking">🔭<b>Coco is looking...</b><small>Places and trips that fit your trip, not just what is popular.</small></div></div> : <div className="xr-results"><div className="xr-result-tabs"><button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>All ({filteredPlaces.length + filteredTrips.length})</button><button className={mode === 'places' ? 'active' : ''} onClick={() => setMode('places')}>Places ({filteredPlaces.length})</button><button className={mode === 'trips' ? 'active' : ''} onClick={() => setMode('trips')}>Trips ({filteredTrips.length})</button></div><div className="xr-coco-note">🔭 <span><b>Here are some places and trips for you!</b><small>Kept close to your pace, budget and route.</small></span></div><div className="xr-grid">{mode !== 'trips' && filteredPlaces.map(place => <article className="xr-card" key={`s-p-${place.id}`} onClick={() => openPlace(place)}><div className="xr-photo"><img src={place.image} alt=""/><span className="xr-kind">PLACE</span><button className={place.saved ? 'xr-heart saved' : 'xr-heart'} onClick={e => { e.stopPropagation(); savePlace(place); }}><Heart size={17} fill={place.saved ? 'currentColor' : 'none'}/></button></div><div className="xr-card-body"><b>{place.name}</b><small>{place.type}</small><em>♥ {place.match}% match</em></div></article>)}{mode !== 'places' && filteredTrips.map(trip => <article className="xr-card xr-trip-card" key={`s-t-${trip.id}`} onClick={() => openTrip(trip)}><div className="xr-photo"><img src={trip.image} alt=""/><span className="xr-kind">TRIP</span><button className="xr-heart" onClick={e => e.stopPropagation()}><Heart size={17}/></button></div><div className="xr-card-body"><b>{trip.title}</b><small>◉ {trip.author}</small><small>{trip.days} days · {trip.places} places</small><em>♥ {trip.match}% match</em></div></article>)}</div></div>}</div>}

    {filtersOpen && <div className="xr-filter-shade" onClick={() => setFiltersOpen(false)}><section className="xr-filter" onClick={e => e.stopPropagation()}><i/><div className="xr-filter-title"><h2>Filters</h2><button onClick={() => setFiltersOpen(false)}><X/></button></div><h3>Content type</h3><div className="xr-filter-pills"><button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>All</button><button className={mode === 'places' ? 'active' : ''} onClick={() => setMode('places')}>Places</button><button className={mode === 'trips' ? 'active' : ''} onClick={() => setMode('trips')}>Trips</button></div><h3>Trip fit</h3><div className="xr-filter-pills"><button className="active">Near our route</button><button>Budget-safe</button><button>Low energy</button><button>Rainy-day</button><button>Group-friendly</button></div><h3>Vibe</h3><div className="xr-filter-pills"><button className="active">☕ Café</button><button>🍴 Food</button><button>⛰ Nature</button><button>🏛 Cultural</button><button>🛍 Shopping</button><button>◇ Hidden gem</button></div><div className="xr-filter-actions"><button onClick={() => setMode('all')}>Reset</button><button className="primary" onClick={() => setFiltersOpen(false)}>Show results</button></div></section></div>}

    {detail?.kind === 'place' && (() => { const place = places.find(p => p.id === detail.item.id) ?? detail.item; return <div className="xr-fullscreen xr-detail"><div className="xr-detail-hero"><img src={place.image} alt=""/><button onClick={() => setDetail(null)}><ChevronLeft/></button><button className={place.saved ? 'saved' : ''} onClick={() => savePlace(place)}><Heart fill={place.saved ? 'currentColor' : 'none'}/></button></div><div className="xr-detail-body"><h2>{place.name}</h2><p>{place.type} · {destination}</p><div className="xr-match">♥ {place.match}% match for your group <span>👩🏻‍🦰👩🏻👩🏻‍🦱</span></div><h3>Why this fits your trip</h3><ul><li><Heart/>Matches your café / food preferences</li><li><Clock/>Fits your {place.duration} window</li><li><Wallet/>Within your current budget style</li><li><Users/>Works with the group’s shared signals</li><li><CloudRain/>Good flexible stop if plans change</li></ul><blockquote>“{place.why}”<small>— Coco</small></blockquote><div className="xr-detail-actions"><button onClick={() => savePlace(place)} className={place.saved ? 'saved' : ''}><Bookmark/> {place.saved ? 'Saved' : 'Save'}</button><button className={place.suggested ? 'suggested' : 'primary'} onClick={() => suggestPlace(place)}><Send/> {place.suggested ? 'Suggested to group' : 'Suggest to group'}</button></div></div></div>; })()}

    {detail?.kind === 'trip' && (() => { const trip = trips.find(t => t.id === detail.item.id) ?? detail.item; return <div className="xr-fullscreen xr-detail"><div className="xr-detail-hero xr-trip-hero"><img src={trip.image} alt=""/><button onClick={() => setDetail(null)}><ChevronLeft/></button><button onClick={() => setTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: !item.saved } : item))}><Heart fill={trip.saved ? 'currentColor' : 'none'}/></button><strong>{trip.title}</strong></div><div className="xr-detail-body"><div className="xr-author"><span>👩🏻</span><div><b>{trip.author}</b><small>Public trip · shared by traveller</small></div><button>Follow</button></div><p>{trip.description}</p><div className="xr-trip-meta"><span>{trip.days} days</span><span>{trip.places} places</span><span>Budget-friendly</span><span>Cafés</span><span>Local</span></div><h3>Places in this trip</h3><div className="xr-trip-places">{places.slice(0,3).map((place,i) => <button key={place.id} onClick={() => setDetail({kind:'place',item:place})}><img src={place.image} alt=""/><b>{i+1}. {place.name}</b></button>)}</div><button className="xr-save-trip" onClick={() => { setTrips(items => items.map(item => item.id === trip.id ? { ...item, saved: true } : item)); setToast('Trip inspiration saved'); }}>Save trip inspiration</button></div></div>; })()}

    {toast && <div className="xr-toast">✓ {toast}</div>}
  </div>;

  return createPortal(ui, host);
}
