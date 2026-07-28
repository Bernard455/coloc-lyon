"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ListingDTO } from "@/types/listing";
import Link from "next/link";

// Utilise OpenStreetMap par défaut (aucune clé API requise). Pour basculer
// sur Google Maps, remplacer ce composant par une intégration
// @react-google-maps/api en gardant la même prop `listings`.

const LYON_CENTER: [number, number] = [45.764, 4.8357];

export function MapView({ listings }: { listings: ListingDTO[] }) {
  return (
    <MapContainer center={LYON_CENTER} zoom={12} scrollWheelZoom className="h-full w-full rounded-xl2">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing) => (
        <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
          <Popup>
            <div className="w-48">
              <p className="font-semibold">{listing.title}</p>
              <p className="text-sm">{listing.totalRentEuros} € /mois · {listing.pricePerPersonEuros} €/pers.</p>
              <Link href={`/listing/${listing.id}`} className="text-sm text-brand-600 underline">
                Voir l'annonce
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
