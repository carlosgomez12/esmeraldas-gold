import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { MediaManager } from "@/components/admin/media-manager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      originalUrl: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      alt: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <PageTitle title="Medios" description="Biblioteca de imágenes para el catálogo." />
      <MediaManager
        assets={assets.map((a) => ({
          id: a.id,
          originalUrl: a.originalUrl,
          fileName: a.fileName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          alt: a.alt,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}