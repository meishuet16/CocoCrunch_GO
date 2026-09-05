import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, ChevronLeft, Clock, Heart, MapPin, Search, Send, SlidersHorizontal, Users, Wallet, X } from 'lucide-react';
import { emitExperience } from '../../experience';
import { commitRitualState, loadRitualState } from '../../ritualState';
import { loadPersisted } from '../../persistence';
import { discoverPlaces } from '../../domain/discovery';
import { scoreTingo } from '../../domain/tingo';

type FeedMode = 'all' | 'places' | 'trips';
type Place = { id:number; name:string; type:string; cost:string; duration:string; match:number; why:string; source:string; image:string; saved:boolean; suggested:boolean };
type Trip = { id:number; title:string; author:string; match:number; days:number; places:number; image:string; description:string; saved:boolean; tags:string[] };
type Detail = { kind:'place'; item:Place } | { kind:'trip'; item:Trip } | null;

const photos = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=900&q=84',
  'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=900&q=84',
];

const extraPlaces = [
  ['Walden Woods Kyoto','Café · Garden','RM28 est.','1.5h',96,'Quiet, photogenic and easy to fit into a slower afternoon.'],
  ['Kiyosumi Garden','Nature · Garden','RM12 est.','1h',93,'A calm low-energy stop with breathing room between busier blocks.'],
  ['Yanaka Ginza','Local · Streets','RM35 est.','2h',91,'Small shops and street food without committing the whole day.'],
  ['Kissa You','Café · Retro','RM32 est.','1.5h',90,'A compact café stop that suits your food-first, slower pace.'],
  ['Tsukiji Side Streets','Food · Market','RM55 est.','2h',95,'Food variety, flexible timing and a strong group-friendly fit.'],
  ['Koenji Vintage Walk','Shopping · Local','RM40 est.','2h',89,'Good for browsing without forcing a fixed itinerary anchor.'],
  ['Meguro Riverside','Walk · Scenic','Free','1h',88,'Budget-safe and easy to shorten if the group gets tired.'],
  ['Tokyo Photographic Art Museum','Culture · Indoor','RM38 est.','2h',87,'Rain-safe, indoor and easy to combine with nearby cafés.'],
] as const;

const tripSeed: Trip[] = [
  { id:1,title:'Tokyo slow food + vintage streets',author:'Aki',match:92,days:5,places:12,image:photos[3],description:'A five-day trip filled with good food, tiny shops and unplanned detours. Built around a slow pace rather than a checklist.',saved:false,tags:['Food','Vintage','Local'] },
  { id:2,title:'A rainy day in Tokyo',author:'Mina',match:90,days:3,places:8,image:photos[1],description:'Rain-friendly cafés, covered streets and indoor stops for a Tokyo weekend that still feels full.',saved:false,tags:['Rainy-day','Cafés','Low energy'] },
  { id:3,title:'Kyoto café hopping',author:'Rin',match:88,days:2,places:7,image:photos[4],description:'Quiet cafés, local sweets and small streets worth slowing down for.',saved:false,tags:['Café','Local','Photography'] },
  { id:4,title:'Osaka food crawl after dark',author:'Jay',match:94,days:4,places:10,image:photos[6],description:'Night markets, casual counters and a flexible food-first route across Osaka.',saved:false,tags:['Food','Night','Group'] },
  { id:5,title:'Tokyo on a student budget',author:'Suki',match:91,days:4,places:14,image:photos[7],description:'Free viewpoints, neighbourhood walks and affordable meals with enough buffer for surprises.',saved:false,tags:['Budget','Local','Walking'] },
  { id:6,title:'Slow mornings in Kyoto',author:'Tom',match:89,days:3,places:9,image:photos[8],description:'Temple mornings, coffee, gardens and intentionally empty afternoons.',saved:false,tags:['Slow','Nature','Café'] },
];

function patchPersisted(name:string, patch:{saved?:boolean;added?:boolean}) {
  try {
    const key='cococrunch:v1';
    const raw=localStorage.getItem(key);
    if (!raw) return;
    const parsed=JSON.parse(raw);
    const current=Array.isArray(parsed.recommendations)?parsed.recommendations:[];
    const exists=current.some((r:{name?:string})=>r.name===name);
    parsed.recommendations=exists?current.map((r:{name?:string})=>r.name===name?{...r,...patch}:r):[...current,{name,saved:Boolean(patch.saved),added:Boolean(patch.added)}];
    localStorage.setItem(key,JSON.stringify(parsed));
  } catch { /* progressive enhancement */ }
}

export default function ExploreReplicaV2(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [query,setQuery]=useState('');
  const [searchOpen,setSearchOpen]=useState(false);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [mode,setMode]=useState<FeedMode>('all');
  const [category,setCategory]=useState('For you');
  const [detail,setDetail]=useState<Detail>(null);
  const [toast,setToast]=useState<string|null>(null);
  const [trips,setTrips]=useState(tripSeed);

  const persisted=useMemo(()=>loadPersisted(),[]);
  const destination=persisted.destination||persisted.tripIntent?.destination||'Tokyo';
  const dimensions=useMemo(()=>scoreTingo(persisted.tingoAnswers??[]),[persisted.tingoAnswers]);
  const initialPlaces=useMemo<Place[]>(()=>{
    const real=discoverPlaces(destination,dimensions);
    const saved=persisted.recommendations??[];
    const base:Place[]=real.map((p,i)=>({id:i+1,name:p.name,type:p.type,cost:p.cost,duration:p.duration,match:p.match,why:p.why,source:p.source,image:photos[i%photos.length],saved:Boolean(saved.find(r=>r.name===p.name)?.saved),suggested:Boolean(saved.find(r=>r.name===p.name)?.added)}));
    const names=new Set(base.map(p=>p.name));
    extraPlaces.forEach((p,i)=>{ if(!names.has(p[0])) base.push({id:base.length+1,name:p[0],type:p[1],cost:p[2],duration:p[3],match:p[4],why:p[5],source:'prototype-catalog',image:photos[(i+2)%photos.length],saved:Boolean(saved.find(r=>r.name===p[0])?.saved),suggested:Boolean(saved.find(r=>r.name===p[0])?.added)}); });
    return base.slice(0,10);
  },[destination,dimensions,persisted.recommendations]);
  const [places,setPlaces]=useState(initialPlaces);

  useEffect(()=>{ const find=()=>setHost(document.querySelector('.explore-screen')); find(); const o=new MutationObserver(find); o.observe(document.body,{childList:true,subtree:true}); return()=>o.disconnect(); },[]);
  useEffect(()=>{ if(!toast)return; const t=window.setTimeout(()=>setToast(null),1600); return()=>window.clearTimeout(t); },[toast]);

  const q=query.trim().toLowerCase();
  const destinationHit=q&&destination.toLowerCase().includes(q);
  const filteredPlaces=places.filter(p=>!q||destinationHit||`${p.name} ${p.type} ${p.why}`.toLowerCase().includes(q));
  const filteredTrips=trips.filter(t=>!q||`${t.title} ${t.author} ${t.tags.join(' ')}`.toLowerCase().includes(q));

  function savePlace(place:Place){
    if(place.saved){ setPlaces(xs=>xs.map(x=>x.id===place.id?{...x,saved:false}:x)); patchPersisted(place.name,{saved:false}); setToast('Removed from saved'); return; }
    emitExperience({type:'capture-place',place:place.name,save:()=>{ const current=loadRitualState(); const savedIdeas=[...(current.savedIdeas??[]).filter(x=>x.name!==place.name),{name:place.name,source:place.source}]; if(!commitRitualState({savedIdeas}))return false; setPlaces(xs=>xs.map(x=>x.id===place.id?{...x,saved:true}:x)); patchPersisted(place.name,{saved:true}); setToast('Saved!'); return true; }});
  }
  function suggestPlace(place:Place){ const next=!place.suggested; setPlaces(xs=>xs.map(x=>x.id===place.id?{...x,suggested:next}:x)); patchPersisted(place.name,{added:next}); setToast(next?'Suggested to group':'Suggestion removed'); }
  function saveTrip(trip:Trip){ setTrips(xs=>xs.map(x=>x.id===trip.id?{...x,saved:!x.saved}:x)); setToast(trip.saved?'Removed from saved':'Trip inspiration saved'); }

  if(!host)return null;
  const categories=['For you','Places','Trips','Cafés','Food','Nature'];
  const PlaceCard=({place}:{place:Place})=><article className="x2-card" onClick={()=>setDetail({kind:'place',item:place})}><div className="x2-photo"><img src={place.image} alt=""/><span>PLACE</span><button className={place.saved?'saved':''} onClick={e=>{e.stopPropagation();savePlace(place)}}><Heart size={17} fill={place.saved?'currentColor':'none'}/></button>{place.suggested&&<em className="x2-suggested">Suggested</em>}</div><div className="x2-cardbody"><b>{place.name}</b><small>{place.type} · {place.cost}</small><strong>♥ {place.match}% match</strong><small><Clock size={12}/> {place.duration}</small></div></article>;
  const TripCard=({trip}:{trip:Trip})=><article className="x2-card" onClick={()=>setDetail({kind:'trip',item:trip})}><div className="x2-photo"><img src={trip.image} alt=""/><span>TRIP</span><button className={trip.saved?'saved':''} onClick={e=>{e.stopPropagation();saveTrip(trip)}}><Heart size={17} fill={trip.saved?'currentColor':'none'}/></button></div><div className="x2-cardbody"><b>{trip.title}</b><small>◉ {trip.author}</small><small>{trip.days} days · {trip.places} places</small><strong>♥ {trip.match}% match</strong></div></article>;

  const ui=<div className="x2-root">
    <header className="x2-head"><div><span>EXPLORE · COCO PICKS</span><h1>Explore</h1></div><small>Find places and trips that fit your people, pace and budget.</small></header>
    <button className="x2-search" onClick={()=>setSearchOpen(true)}><Search size={18}/><span>{query||'Search cafés, places, trips...'}</span><SlidersHorizontal size={18}/></button>
    <div className="x2-chips">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);setMode(c==='Places'?'places':c==='Trips'?'trips':'all')}}>{c}</button>)}</div>
    <section className="x2-feature" onClick={()=>setSearchOpen(true)}><img src={photos[1]} alt="Tokyo street"/><div><small>COCO FOUND A DETOUR</small><b>Find your next<br/>favourite place.</b></div><i>→</i></section>
    {(mode==='all'||mode==='places')&&<section className="x2-section"><div className="x2-title"><h2>{mode==='places'?'Places for your trip':'Recommended for you'}</h2><button onClick={()=>{setMode('places');setCategory('Places')}}>See all</button></div><div className="x2-grid">{filteredPlaces.slice(0,mode==='places'?10:6).map(p=><PlaceCard key={p.id} place={p}/>)}</div></section>}
    {(mode==='all'||mode==='trips')&&<section className="x2-section"><div className="x2-title"><h2>Trips from the community</h2><button onClick={()=>{setMode('trips');setCategory('Trips')}}>See all</button></div><div className="x2-grid">{filteredTrips.slice(0,mode==='trips'?6:4).map(t=><TripCard key={t.id} trip={t}/>)}</div></section>}

    {searchOpen&&<div className="x2-full"><div className="x2-searchtop"><button onClick={()=>setSearchOpen(false)}><ChevronLeft/></button><label><Search size={17}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="quiet cafe near shibuya"/>{query&&<button onClick={()=>setQuery('')}><X size={15}/></button>}</label><button onClick={()=>setFiltersOpen(true)}><SlidersHorizontal/></button></div>{!q?<div className="x2-suggestions"><h3>Try searching</h3>{['quiet cafe near shibuya','cafe with good matcha','hidden gems in tokyo','rainy day indoor activities','budget-safe food','low energy afternoon'].map(s=><button key={s} onClick={()=>setQuery(s)}><Search size={15}/>{s}</button>)}<div>🔭<b>Coco is looking...</b><small>Places and trips that fit this trip.</small></div></div>:<div className="x2-results"><div className="x2-tabs"><button className={mode==='all'?'active':''} onClick={()=>setMode('all')}>All ({filteredPlaces.length+filteredTrips.length})</button><button className={mode==='places'?'active':''} onClick={()=>setMode('places')}>Places ({filteredPlaces.length})</button><button className={mode==='trips'?'active':''} onClick={()=>setMode('trips')}>Trips ({filteredTrips.length})</button></div><div className="x2-note">🔭 <span><b>Here are some places and trips for you!</b><small>Kept close to your pace, budget and route.</small></span></div><div className="x2-grid">{mode!=='trips'&&filteredPlaces.map(p=><PlaceCard key={`s${p.id}`} place={p}/>)}{mode!=='places'&&filteredTrips.map(t=><TripCard key={`t${t.id}`} trip={t}/>)}</div></div>}</div>}

    {filtersOpen&&<div className="x2-shade" onClick={()=>setFiltersOpen(false)}><section className="x2-filter" onClick={e=>e.stopPropagation()}><i/><div><h2>Filters</h2><button onClick={()=>setFiltersOpen(false)}><X/></button></div><h3>Content type</h3><nav><button className={mode==='all'?'active':''} onClick={()=>setMode('all')}>All</button><button className={mode==='places'?'active':''} onClick={()=>setMode('places')}>Places</button><button className={mode==='trips'?'active':''} onClick={()=>setMode('trips')}>Trips</button></nav><h3>Trip fit</h3><nav><button className="active">Near our route</button><button>Budget-safe</button><button>Low energy</button><button>Rainy-day</button><button>Group-friendly</button></nav><h3>Vibe</h3><nav><button className="active">☕ Café</button><button>🍴 Food</button><button>⛰ Nature</button><button>🏛 Culture</button><button>🛍 Shopping</button><button>◇ Hidden gem</button></nav><footer><button onClick={()=>setMode('all')}>Reset</button><button className="primary" onClick={()=>setFiltersOpen(false)}>Show results</button></footer></section></div>}

    {detail?.kind==='place'&&(()=>{const p=places.find(x=>x.id===detail.item.id)??detail.item;return <div className="x2-full x2-detail"><div className="x2-hero"><img src={p.image} alt=""/><button onClick={()=>setDetail(null)}><ChevronLeft/></button><button className={p.saved?'saved':''} onClick={()=>savePlace(p)}><Heart fill={p.saved?'currentColor':'none'}/></button></div><div className="x2-detailbody"><h2>{p.name}</h2><p>{p.type} · {destination}</p><div className="x2-match">♥ {p.match}% match for your group <span>👩🏻 👩🏻‍🦱 👩🏻‍🦰</span></div><h3>Why this fits your trip</h3><ul><li><Heart/>Matches your food / café preferences</li><li><Clock/>Fits a {p.duration} window</li><li><Wallet/>Within your current budget style</li><li><Users/>Works with your group preference mix</li><li><MapPin/>{p.why}</li></ul><blockquote>“Good option when you want something memorable without making the whole day rigid.” <b>— Coco</b></blockquote><div className="x2-actions"><button className={p.saved?'saved':''} onClick={()=>savePlace(p)}><Bookmark/>{p.saved?'Saved':'Save'}</button><button className={p.suggested?'suggested':''} onClick={()=>suggestPlace(p)}><Send/>{p.suggested?'Suggested to group':'Suggest to group'}</button></div>{p.suggested&&<small className="x2-governance">Proposal only · the official itinerary still needs group confirmation.</small>}</div></div>})()}

    {detail?.kind==='trip'&&<div className="x2-full x2-detail"><div className="x2-hero"><img src={detail.item.image} alt=""/><button onClick={()=>setDetail(null)}><ChevronLeft/></button><button className={detail.item.saved?'saved':''} onClick={()=>saveTrip(detail.item)}><Heart fill={detail.item.saved?'currentColor':'none'}/></button><strong>{detail.item.title}</strong></div><div className="x2-detailbody"><div className="x2-author"><span>◉</span><div><b>{detail.item.author}</b><small>Public completed trip</small></div></div><p>{detail.item.description}</p><div className="x2-tagrow">{detail.item.tags.map(t=><span key={t}>{t}</span>)}</div><h3>Places in this trip</h3><div className="x2-tripplaces">{places.slice(0,3).map(p=><button key={p.id} onClick={()=>setDetail({kind:'place',item:p})}><img src={p.image} alt=""/><b>{p.name}</b></button>)}</div><button className="x2-save-trip" onClick={()=>saveTrip(detail.item)}>{detail.item.saved?'✓ Trip inspiration saved':'Save trip inspiration'}</button></div></div>}
    {toast&&<div className="x2-toast">{toast}</div>}
  </div>;
  return createPortal(ui,host);
}
