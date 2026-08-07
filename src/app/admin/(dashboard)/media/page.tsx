import { Suspense } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import FlashToast from "@/components/admin/FlashToast";
import MediaCard from "@/components/admin/MediaCard";
import Pagination from "@/components/admin/Pagination";
import UploadMediaButton from "@/components/admin/UploadMediaButton";
import { getPayloadClient } from "@/lib/payload";
import { deleteMedia, uploadMedia } from "./actions";

const PAGE_SIZE = 24;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const payload = await getPayloadClient();
  const { docs: media, totalDocs, totalPages } = await payload.find({
    collection: "media",
    sort: "-createdAt",
    limit: PAGE_SIZE,
    page,
  });

  return (
    <>
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminTopbar title="Media Library" actions={<UploadMediaButton uploadAction={uploadMedia} />} />
      <div className="p-6 md:p-8">
        {media.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant p-16 flex flex-col items-center justify-center text-center gap-3">
            <span aria-hidden className="material-symbols-outlined text-4xl text-outline">
              photo_library
            </span>
            <p className="font-headline text-headline-sm text-on-surface">No media uploaded yet</p>
            <p className="font-body text-body-md text-on-surface-variant max-w-sm">
              Images you upload here can be reused across products and page blocks. Photos you upload from a
              product or category form show up here automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((item) => (
                <MediaCard key={item.id} item={item} deleteAction={deleteMedia} />
              ))}
            </div>
            <div className="mt-8">
              <Pagination
                basePath="/admin/media"
                page={page}
                totalPages={totalPages}
                totalDocs={totalDocs}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
