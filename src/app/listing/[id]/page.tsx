import { getPopularityInfo } from "@/lib/popularity";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScoreBadge } from "@/components/ScoreBadge";
import type { Metadata } from "next";

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { position: "asc" } },
      _count: { select: { favorites: true } }
    }
  });
  return listing;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "Annonce introuvable" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    openGraph: { images: listing.mainPhotoUrl ? [listing.mainPhotoUrl] : [] }
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const pricePerPerson = Math.round(listing.totalRent / 100 / Math.max(listing.numberOfRooms, 4));
  const popularity = getPopularityInfo(listing._count?.favorites ?? 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: listing.title,
    description: listing.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      postalCode: listing.postalCode,
      addressCountry: "FR"
    },
    geo: { "@type": "GeoCoordinates", latitude: listing.latitude, longitude: listing.longitude },
    numberOfRooms: listing.numberOfRooms,
    floorSize: listing.surfaceM2 ? { "@type": "QuantitativeValue", value: listing.surfaceM2, unitCode: "MTK" } : undefined,
    image: listing.mainPhotoUrl,
    offers: {
      "@type": "Offer",
      price: listing.totalRent / 100,
      priceCurrency: "EUR",
      availability: listing.status === "ACTIVE" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <main className="mx-auto max-w-5xl px-4 py-8">
      <a href="/" className="mb-4 inline-block text-sm text-brand-600 hover:underline">
        ← Retour aux résultats
      </a>

      <div className="mb-6 grid grid-cols-2 gap-2 overflow-hidden rounded-xl2 sm:grid-cols-4">
        {(listing.photos.length ? listing.photos : [{ url: "", id: "placeholder" }]).slice(0, 4).map((photo, i) => (
          <div key={photo.id} className={`relative aspect-square bg-gray-100 dark:bg-gray-800 ${i === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""}`}>
            {photo.url && <Image src={photo.url} alt={listing.title} fill className="object-cover" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <div className="flex flex-col items-end gap-1.5">
              {popularity && (
                <span className="badge bg-white/90 text-gray-800" title={popularity.label}>
                  {popularity.emoji} {popularity.label}
                </span>
              )}
              {listing.qualityScore !== null && (
                <ScoreBadge score={listing.qualityScore} breakdown={listing.scoreBreakdown as any} />
              )}
            </div>
          </div>
          <p className="mb-4 text-gray-500 dark:text-gray-400">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ""}
            {listing.city} — {listing.address}
          </p>

          {listing.numberOfRooms === 3 && (
            <div className={`mb-4 rounded-xl2 p-4 text-sm ${listing.fourthRoomStatus === "COMPATIBLE" ? "badge-success" : "badge-warning"}`}>
              {listing.fourthRoomStatus === "COMPATIBLE" ? `✅ Compatible ${listing.numberOfRooms + 1} colocataires` : "❓ À vérifier auprès du propriétaire"}
              {listing.fourthRoomNote && <p className="mt-1 font-normal">{listing.fourthRoomNote}</p>}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl2 border border-gray-100 p-4 text-sm dark:border-gray-800 sm:grid-cols-3">
            <div><p className="text-gray-400">Surface</p><p className="font-medium">{listing.surfaceM2 ?? "—"} m²</p></div>
            <div><p className="text-gray-400">Chambres</p><p className="font-medium">{listing.numberOfRooms}</p></div>
            <div><p className="text-gray-400">Salles de bain</p><p className="font-medium">{listing.numberOfBathrooms ?? "—"}</p></div>
            <div><p className="text-gray-400">Étage</p><p className="font-medium">{listing.floor ?? "—"}</p></div>
            <div><p className="text-gray-400">Meublé</p><p className="font-medium">{listing.furnished ? "Oui" : "Non"}</p></div>
            <div><p className="text-gray-400">DPE</p><p className="font-medium">{listing.dpeRating ?? "—"}</p></div>
          </div>

          <h2 className="mb-2 font-semibold">Description</h2>
          <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{listing.description}</p>

          <p className="text-xs text-gray-400">
            Source : {listing.source} · Publiée le{" "}
            {listing.externalPublishedAt ? new Date(listing.externalPublishedAt).toLocaleDateString("fr-FR") : "date inconnue"} ·{" "}
            <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Voir l'annonce originale
            </a>
          </p>
        </div>

        <aside className="h-fit space-y-4 rounded-xl2 border border-gray-100 p-5 dark:border-gray-800">
          <div>
            <p className="text-2xl font-bold">{(listing.totalRent / 100).toLocaleString("fr-FR")} € /mois</p>
            <p className="text-sm text-gray-500">{pricePerPerson} € par personne · {listing.chargesIncluded ? "charges comprises" : "charges non comprises"}</p>
          </div>

          <div className="space-y-2 text-sm">
            {listing.agencyName && <p><span className="text-gray-400">Agence :</span> {listing.agencyName}</p>}
            {listing.contactName && <p><span className="text-gray-400">Contact :</span> {listing.contactName}</p>}
            {listing.openingHours && <p><span className="text-gray-400">Horaires :</span> {listing.openingHours}</p>}
          </div>

          <div className="flex flex-col gap-2">
            {listing.contactPhone && (
              <a href={`tel:${listing.contactPhone}`} className="btn-primary">📞 Contacter — {listing.contactPhone}</a>
            )}
            {listing.contactWhatsapp && (
              <a href={`https://wa.me/${listing.contactWhatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">💬 WhatsApp</a>
            )}
            {listing.contactEmail && (
              <a href={`mailto:${listing.contactEmail}`} className="btn-secondary">✉️ Email</a>
            )}
            {listing.contactFormUrl && (
              <a href={listing.contactFormUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">📝 Formulaire de contact</a>
            )}
          </div>
        </aside>
      </div>
    </main>
    </>
  );
}
