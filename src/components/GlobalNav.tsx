import { Box, CalendarDays, Compass, Heart, Home } from 'lucide-react';

export type GlobalTab = 'home' | 'trips' | 'explore' | 'memories' | 'me';

type GlobalNavProps = {
  tab: GlobalTab;
  onChange: (tab: GlobalTab) => void;
  onOpenTrips: () => void;
};

const items: { id: GlobalTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'trips', label: 'Trips', icon: CalendarDays },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'memories', label: 'Memories', icon: Box },
  { id: 'me', label: 'Me', icon: Heart },
];

export function GlobalNav({ tab, onChange, onOpenTrips }: GlobalNavProps) {
  return (
    <nav className="bottom-nav">
      {items.map(item => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            className={tab === item.id ? 'active' : ''}
            aria-current={tab === item.id ? 'page' : undefined}
            onClick={() => {
              if (item.id === 'trips') onOpenTrips();
              onChange(item.id);
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
