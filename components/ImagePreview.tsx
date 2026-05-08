export default function ImagePreview({ imageUrl, imageError }: { imageUrl?: string; imageError?: string }) {
  if (!imageUrl && !imageError) return null;

  return (
    <section className="surface rounded-[2rem] p-4 sm:p-6">
      <p className="label">Generated visual</p>
      {imageError ? <p className="mt-3 rounded-[1.2rem] border border-gold/20 bg-gold/[0.07] p-4 text-sm text-gold/85">{imageError}</p> : null}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Dibbes Refine generated visual" className="mt-4 aspect-square w-full rounded-[1.5rem] border border-ivory/10 object-cover shadow-2xl shadow-black/50" />
      ) : null}
    </section>
  );
}
