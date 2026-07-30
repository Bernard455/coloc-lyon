import Image from "next/image";
import Link from "next/link";
import { ScoreBadge } from "./ScoreBadge";
import type { ListingDTO } from "@/types/listing";

const PROPERTY_TYPE_LABELS: Record<ListingDTO["propertyType"], string> = {
  APARTMENT: "Appartement entier",
  HOUSE: "Maison",
  EXISTING_ROOMMATE_SHARE: "Colocation constituée",
  SINGLE_ROOM: "Chambre individuelle"
};

export function ListingCard({ listing, onToggleFavorite, isFavorite, groupSize = 4 }: { listing: ListingDTO; onToggleFavorite?: (id: string) => void; isFavorite?: boolean; groupSize?: number }) {
  return (
    <div className="card group overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {listing.mainPhotoUrl ? (
          <Image
            src={listing.mainPhotoUrl}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">Pas de photo</div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="badge bg-white/90 text-gray-800 backdrop-blur">{PROPERTY_TYPE_LABELS[listing.propertyType]}</span>
          {listing.fourthRoomStatus === "COMPATIBLE" && <span className="badge badge-success">✅ Compatible {groupSize} colocataires</span>}
          {listing.fourthRoomStatus === "UNKNOWN" && listing.numberOfRooms === groupSize - 1 && (
            <span className="badge badge-warning">❓ À vérifier auprès du propriétaire</span>
          )}
          {listing.isSuspicious && <span className="badge badge-danger">⚠ Annonce à vérifier</span>}
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(listing.id)}
            aria-label="Ajouter aux favoris"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg backdrop-blur transition hover:scale-110"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}

        {listing.qualityScore !== null && (
          <div className="absolute bottom-3 right-3">
            <ScoreBadge score={listing.qualityScore} breakdown={listing.scoreBreakdown} />
          </div>
        )}
      </div>

      <Link href={`/listing/${listing.id}`} className="block p-4">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold">{listing.totalRentEuros.toLocaleString("fr-FR")} € /mois</p>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-400">{listing.pricePerPersonEuros} €/pers.</p>
        </div>
        <h3 className="mb-2 line-clamp-1 font-semibold text-gray-800 dark:text-gray-100">{listing.title}</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
          {listing.city}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
          {listing.surfaceM2 && <span>📐 {listing.surfaceM2} m²</span>}
          <span>🛏 {listing.numberOfRooms} chambres</span>
          {listing.numberOfBathrooms && <span>🚿 {listing.numberOfBathrooms} SdB</span>}
          {listing.dpeRating && <span>⚡ DPE {listing.dpeRating}</span>}
          {listing.distanceMetroM !== null && listing.distanceMetroM !== undefined && <span>🚇 {listing.distanceMetroM} m</span>}
        </div>
      </Link>
    </div>
  );
}
