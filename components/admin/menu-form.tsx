"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, MenuItem } from "@/lib/menu-types";
export function MenuForm({ categories, dish }: { categories: Category[]; dish?: MenuItem }) {
  const router = useRouter();
  const requestId = useRef(dish?.id || "");
  const lock = useRef(false);
  const [type, setType] = useState(dish?.type || "regular");
  const [image, setImage] = useState(dish?.image || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const upload = async (file?: File) => {
    if (!file) return;
    setError(""); setNotice("");
    if (file.size > 4 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Choose a JPEG, PNG or WebP image up to 4 MB."); return; }
    setUploading(true);
    try { const response = await fetch("/api/admin/uploads", { method: "POST", headers: { "Content-Type": file.type }, body: file }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setImage(result.url); setNotice("Image uploaded. Save the dish to publish this change."); }
    catch (error) { setError(error instanceof Error ? error.message : "Upload failed. Try again."); }
    finally { setUploading(false); }
  };
  return <form className="admin-form" onSubmit={async event => {
    event.preventDefault(); if (lock.current || uploading) return;
    const data = new FormData(event.currentTarget);
    const price = String(data.get("price") || "");
    if (!/^\d+(\.\d{1,2})?$/.test(price)) { setError("Enter a valid price with at most two decimals."); return; }
    if (type === "chef-special" && !image) { setError("Upload an image for this Chef Special."); return; }
    lock.current = true; setSaving(true); setError("");
    requestId.current ||= crypto.randomUUID();
    const input = { id: requestId.current, name: data.get("name"), description: data.get("description"), priceCents: Math.round(Number(price)*100), categoryId: data.get("categoryId"), type, image,
      available: data.has("available"), visible: data.has("visible"), sortOrder: Number(data.get("sortOrder")), vegetarian: data.has("vegetarian"), vegan: data.has("vegan"), tag: data.get("tag"), featured: data.has("featured"), featuredDescription: data.get("featuredDescription"), updatedAt: dish?.updatedAt };
    try { const response = await fetch(dish ? `/api/admin/menu/${dish.id}` : "/api/admin/menu", { method: dish ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); router.push("/admin/menu?saved=1"); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not save the dish."); lock.current = false; setSaving(false); }
  }}>
    <fieldset disabled={saving || uploading} className="admin-form-grid">
      <div className="admin-panel admin-fields"><h2>Dish details</h2>
        <label>Dish name<input name="name" required maxLength={120} defaultValue={dish?.name} placeholder="e.g. Chicken Tikka" /></label>
        <label>Description<textarea name="description" maxLength={2000} rows={4} defaultValue={dish?.description} placeholder="Ingredients, preparation and what makes it special." /></label>
        <div className="admin-two"><label>Price (USD)<input name="price" type="number" required min="0" max="10000" step="0.01" defaultValue={dish ? (dish.priceCents/100).toFixed(2) : ""} placeholder="0.00" /></label>
        <label>Sort order<input name="sortOrder" type="number" required min="-100000" max="100000" step="1" defaultValue={dish?.sortOrder || 0} /></label></div>
        <label>Category<select name="categoryId" aria-label="Category" required defaultValue={dish?.categoryId || ""}><option value="" disabled>Select a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.title}{category.kicker ? ` · ${category.kicker}` : ""}</option>)}</select></label>
        <label>Dish type<select aria-label="Dish type" value={type} onChange={event => setType(event.target.value as MenuItem["type"])}><option value="regular">Regular dish</option><option value="chef-special">Chef Special</option></select></label>
        <div className="admin-checks"><label><input type="checkbox" name="vegetarian" defaultChecked={dish?.vegetarian} />Vegetarian</label><label><input type="checkbox" name="vegan" defaultChecked={dish?.vegan} />Vegan (also vegetarian)</label></div>
        <label>Short note (optional)<input name="tag" maxLength={60} defaultValue={dish?.tag || ""} placeholder="e.g. Sweet" /></label>
      </div>
      <div className="admin-fields"><section className="admin-panel admin-fields"><h2>Presentation</h2>
        {image ? <div className="admin-image-preview"><Image src={image} alt="Dish image preview" width={640} height={440} loading="eager" style={{ objectFit: "cover" }} /></div> : <div className="admin-upload-empty">{type === "chef-special" ? "Add your Chef Special photograph" : "Regular dishes do not need a photograph"}</div>}
        <label className="admin-upload-label">{image ? "Replace image" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
        <small>JPEG, PNG or WebP · up to 4 MB. Images are resized and optimized automatically.</small>
        {image && <button className="admin-button" type="button" onClick={() => { setImage(""); setNotice("Image removed from the form. Save to apply."); }}>Remove image</button>}
        <label className="admin-check"><input type="checkbox" name="featured" defaultChecked={dish?.featured} />Feature this dish on the homepage and menu</label>
        <label>Featured description (optional)<textarea name="featuredDescription" maxLength={2000} rows={3} defaultValue={dish?.featuredDescription || ""} /></label>
      </section><section className="admin-panel admin-fields"><h2>Publishing</h2>
        <label className="admin-check"><input type="checkbox" name="available" defaultChecked={dish?.available ?? true} />Available to order</label>
        <label className="admin-check"><input type="checkbox" name="visible" defaultChecked={dish?.visible ?? true} />Visible on the website</label>
        <p className="admin-muted">Only visible, available dishes appear publicly. Lower sort positions appear first within each category.</p>
      </section></div>
    </fieldset>
    {uploading && <p role="status">Uploading image…</p>}{notice && <p role="status">{notice}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-form-footer"><Link className="admin-button" href="/admin/menu">Cancel</Link><button className="admin-button primary" disabled={saving || uploading}>{saving ? "Saving dish…" : dish ? "Save changes" : "Create dish"}</button></div>
  </form>;
}
