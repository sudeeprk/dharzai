"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkIcon, Globe2, Star, MapPin } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="h-4 w-4 text-yellow-500 fill-yellow-500"
        />
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
    <Card className="overflow-hidden h-full flex flex-col relative border shadow-md hover:shadow-lg transition-shadow">
      <div className="relative w-full h-48">
        <Image
          src={place.photoUrl || "https://placehold.co/600x400.png"}
          alt={place.displayName?.text || "Placeholder"}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
          data-ai-hint="restaurant food"
        />
      </div>

      <CardHeader className="pb-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-lg font-semibold truncate cursor-help">
                {place.displayName?.text}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent>{place.displayName?.text}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col justify-between gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-muted-foreground truncate cursor-help">
                {place.formattedAddress}
              </p>
            </TooltipTrigger>
            <TooltipContent>{place.formattedAddress}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {place.rating && (
          <div className="flex items-center gap-1">
            {renderStars(place.rating)}
            <span className="text-xs text-muted-foreground">
              ({place.rating.toFixed(1)})
            </span>
          </div>
        )}

        {place.websiteUri && (
          <div className="text-xs text-blue-600 hover:underline mt-1 truncate">
            <Link href={place.websiteUri} target="_blank">
              <div className="flex items-center gap-1">
                <Globe2 className="w-4 h-4" />
                Website
              </div>
            </Link>
          </div>
        )}

        {place.reviews?.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground truncate cursor-help">
                  “{place.reviews[0].text?.text || "No review text"}”
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs whitespace-pre-line">
                  {place.reviews[0].text?.text}
                </p>
                <p className="text-right text-muted-foreground mt-1 text-[10px]">
                  — {place.reviews[0].authorAttribution?.displayName || "User"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>

      {place.googleMapsUri && (
        <div className="absolute bottom-3 right-3 bg-background rounded-full p-1">
          <Link href={place.googleMapsUri} target="_blank">
            <MapPin className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </Link>
        </div>
      )}
    </Card>
  );
}
