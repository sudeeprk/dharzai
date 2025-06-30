'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      ))}
      {halfStar && <Star className="h-4 w-4 text-yellow-500" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

export function PlaceCard({ place }: { place: any }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={place.photoUrl || 'https://placehold.co/600x400.png'}
          alt={place.displayName?.text || 'Placeholder'}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
          data-ai-hint="restaurant food"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg truncate">{place.displayName?.text}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-muted-foreground mb-2 truncate">{place.formattedAddress}</p>
        <div className="flex items-center gap-2 mt-auto">
          {place.rating && (
            <>
              {renderStars(place.rating)}
              <span className="text-xs text-muted-foreground">({place.rating.toFixed(1)})</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
