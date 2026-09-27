"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getOwnerProperty, updateProperty, uploadPropertyImage, type PropertyImageCreate } from "@/services/owner";

export function PropertyImagesManagementSection0() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;
  const [images, setImages] = useState<PropertyImageCreate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [original, setOriginal] = useState<PropertyImageCreate[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOwnerProperty(id)
      .then((prop) => {
        const imgs: PropertyImageCreate[] = prop.images.map((img, idx) => ({ image_url: img.image_url, imagekit_file_id: img.imagekit_file_id, is_primary: img.is_primary, display_order: img.display_order ?? idx }));
        setImages(imgs);
        setOriginal(imgs);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const hasChanges = JSON.stringify(images) !== JSON.stringify(original);

  function setPrimary(idx: number) {
    setImages((prev) => prev.map((im, i) => ({ ...im, is_primary: i === idx })));
  }
  function removeImage(idx: number) {
    setImages((prev) => {
      const f = prev.filter((_, i) => i !== idx);
      if (f.length && !f.some((im) => im.is_primary)) f[0].is_primary = true;
      return f.map((im, i) => ({ ...im, display_order: i }));
    });
  }
  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error(`${file.name}: Only JPG, PNG, WEBP`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name}: Max 5MB`);
        const res = await uploadPropertyImage(file);
        setImages((prev) => {
          const isFirst = prev.length === 0;
          return [...prev, { image_url: res.image_url, imagekit_file_id: res.imagekit_file_id, is_primary: isFirst, display_order: prev.length }];
        });
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  async function handleSave() {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await updateProperty(id, { images });
      const imgs: PropertyImageCreate[] = updated.images.map((img, idx) => ({ image_url: img.image_url, imagekit_file_id: img.imagekit_file_id, is_primary: img.is_primary, display_order: img.display_order ?? idx }));
      setImages(imgs);
      setOriginal(imgs);
      setToast({ text: updated.status === "pending" ? "Images saved — status reset to Pending for Admin review" : "Images saved successfully", ok: true });
      setTimeout(() => setToast(null), 3500);
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : "Save failed", ok: false });
    } finally {
      setSaving(false);
    }
  }
  function handleDiscard() {
    setImages(original);
    setUploadError(null);
    setToast(null);
  }

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /><span className="text-sm text-primary">Loading images…</span></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-error/20 text-center">
          <Icon name="error" className="material-symbols-outlined text-[32px] text-error mb-2" />
          <h2 className="font-title-md text-title-md font-bold">Failed to load images</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{error}</p>
          <button onClick={() => router.push("/owner/properties")} className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-medium">Back to properties</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <main className="relative pt-6 w-full px-space-lg pb-space-xl bg-surface min-h-screen">
          <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-lg w-full max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-space-xxs">
                  <nav className="flex items-center gap-space-xs text-on-surface-variant font-caption text-caption uppercase tracking-wider">
                    <Link href="/owner" className="hover:text-primary transition-colors">Dashboard</Link>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <Link href="/owner/properties" className="hover:text-primary transition-colors">My Properties</Link>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <Link href={`/owner/properties/${id}/preview`} className="hover:text-primary transition-colors truncate max-w-[160px]">Property #{id}</Link>
                    <Icon name="chevron_right" className="material-symbols-outlined text-[14px]" />
                    <span className="text-primary font-bold">Images</span>
                  </nav>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Manage Property Images</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Upload high-resolution photos of your chalet. Exactly one photo is set as the Primary cover (max 5MB each, JPG/PNG/WEBP, ImageKit).</p>
                  {toast && <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${toast.ok ? "bg-[#ECFDF5] text-[#065F46] border-[#059669]/20" : "bg-[#FFF1F2] text-[#E11D48] border-[#E11D48]/20"}`}><Icon name={toast.ok ? "check_circle" : "error"} className="material-symbols-outlined text-[18px]" />{toast.text}</div>}
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <Link href={`/owner/properties/${id}/edit`} className="inline-flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-xl">Edit Details</Link>
                </div>
              </div>

              <label className="relative group cursor-pointer bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm transition-all hover:bg-surface-container-low/40 flex flex-col items-center justify-center text-center gap-space-sm py-space-md border border-dashed border-outline-variant">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary-container group-hover:text-on-primary transition-all"><Icon name="cloud_upload" className="material-symbols-outlined text-[32px]" /></div>
                <div className="flex flex-col gap-1">
                  <p className="font-title-md text-title-md text-on-surface font-semibold">Drag and drop photos here, or <span className="text-primary underline">browse files</span></p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">PNG, JPG, or WebP up to 5MB each · Recommended min. 1920x1080</p>
                </div>
                <input accept="image/png,image/jpeg,image/webp" className="absolute inset-0 opacity-0 cursor-pointer" type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
                <span className="text-xs text-on-surface-variant">{uploading ? "Uploading…" : "Click to select"}</span>
              </label>
              {uploadError && <div className="p-3 rounded-xl bg-[#FFF1F2] text-[#E11D48] text-sm flex items-center gap-2"><Icon name="error" className="material-symbols-outlined text-[18px]" />{uploadError}</div>}

              <div className="bg-surface-container-high rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-start gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm"><Icon name="lightbulb" className="material-symbols-outlined text-[22px]" /></div>
                  <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-on-surface">Tips for Lebanese chalet photography</span><span className="font-body-md text-body-md text-on-surface-variant">Prioritize crisp natural light, basalt hearths, cedar furniture, snow panoramas and heated terraces.</span></div>
                </div>
                <span className="shrink-0 bg-surface-container-lowest text-secondary font-label-sm text-label-sm px-space-sm py-1 rounded-full font-medium">{images.length} uploaded · Primary required</span>
              </div>

              <div className="flex items-center justify-between mt-space-xs">
                <div className="flex items-center gap-space-xs"><span className="font-title-md text-title-md font-semibold">Uploaded Gallery</span><span className="text-on-surface-variant font-label-md text-label-md">· Click to set primary</span></div>
                <span className="text-on-surface-variant font-caption text-caption flex items-center gap-1"><Icon name="verified" className="material-symbols-outlined text-[16px] text-secondary" /> {images.length ? `${images.length} images` : "No images yet"}</span>
              </div>

              {images.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
                  <Icon name="photo_library" className="material-symbols-outlined text-[40px] text-on-surface-variant mb-2" />
                  <p className="font-title-sm text-title-sm font-semibold">No images yet</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Upload your first photo to showcase your property.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                  {images.map((img, idx) => (
                    <div key={idx} className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                        <img src={img.image_url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {img.is_primary && <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary-container text-on-primary font-label-sm text-label-sm px-space-sm py-1 rounded-full shadow-sm font-semibold"><Icon name="star" className="material-symbols-outlined text-[14px]" /> PRIMARY COVER</span>}
                        <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-on-surface/60 backdrop-blur-md flex items-center justify-center text-on-primary font-caption text-caption font-bold">{idx + 1}</span>
                      </div>
                      <div className="p-space-md flex flex-col justify-between flex-1 gap-space-sm">
                        <div className="flex flex-col"><h2 className="font-label-md text-label-md font-semibold truncate">Image {idx + 1} {img.is_primary ? "· Primary" : ""}</h2><p className="font-caption text-caption text-on-surface-variant truncate">{img.imagekit_file_id?.slice(0, 24) || "ImageKit"}</p></div>
                        <div className="flex items-center justify-between pt-space-xs">
                          {img.is_primary ? (
                            <span className="inline-flex items-center gap-1 bg-surface-container-high text-primary font-label-sm text-label-sm px-space-sm py-1.5 rounded-lg font-semibold opacity-80"><Icon name="check_circle" className="material-symbols-outlined text-[16px]" /> Primary Active</span>
                          ) : (
                            <button onClick={() => setPrimary(idx)} className="inline-flex items-center gap-1 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm px-space-sm py-1.5 rounded-lg font-medium"> <Icon name="star_outline" className="material-symbols-outlined text-[16px]" /> Set as Primary</button>
                          )}
                          <button onClick={() => removeImage(idx)} className="text-on-surface-variant hover:text-error p-1 rounded-lg hover:bg-error-container/30"><Icon name="delete" className="material-symbols-outlined text-[20px]" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-20" />
              <div className="fixed bottom-0 right-0 left-0 lg:left-[260px] bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-30 px-space-lg py-space-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <Icon name="sync" className="material-symbols-outlined text-secondary text-[20px]" />
                    <span className={`font-body-md text-body-md ${hasChanges ? "text-on-surface" : "text-on-surface-variant"}`}>{hasChanges ? "Unsaved media adjustments pending" : "All changes saved"}</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <button onClick={handleDiscard} disabled={!hasChanges || saving} className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-xl disabled:opacity-50">Discard</button>
                    <button onClick={handleSave} disabled={!hasChanges || saving} className="inline-flex items-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md px-space-lg py-space-xs rounded-xl shadow-sm disabled:opacity-50">
                      {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon name="done_all" className="material-symbols-outlined text-[18px]" />}
                      {saving ? "Saving…" : "Save Image Order & Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
