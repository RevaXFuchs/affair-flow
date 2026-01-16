import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressLinkProps {
  address: string;
  className?: string;
  showIcon?: boolean;
}

export function AddressLink({ address, className, showIcon = true }: AddressLinkProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors',
        className
      )}
    >
      {showIcon && <MapPin size={14} />}
      <span className="truncate">{address}</span>
    </a>
  );
}
