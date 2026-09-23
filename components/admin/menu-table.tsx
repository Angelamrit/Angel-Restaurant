"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { money, type Category, type MenuItem } from "@/lib/menu-types";
export function MenuTable({ items, categories, initialType, saved }: { items: MenuItem[]; categories: Category[]; initialType?: string; saved: boolean }) {
  const router = useRouter();
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState(initialType || "");
  const [available, setAvailable] = useState("");
  const [visible, setVisible] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [notice, setNotice] = useState(saved ? "Dish saved. The public menu is up to date." : "");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (deleting) dialog.current?.showModal(); else dialog.current?.close(); }, [deleting]);
  const filtered = items.filter(dish => `${dish.name} ${dish.description}`.toLowerCase().includes(search.toLowerCase()) && (!category || dish.categoryId === category) && (!type || dish.type === type) && (!available || String(dish.available) === available) && (!visible || String(dish.visible) === visible));
  const mutate = async (dish: MenuItem, method: "PATCH" | "DELETE", field?: "visible" | "available") => {
    if (busy.current) return; busy.current = true; setPending(true); setError(""); setNotice("");
    try { const response = await fetch(`/api/admin/menu/${dish.id}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ field, enabled: field ? !dish[field] : undefined, updatedAt: dish.updatedAt }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setDeleting(null); setNotice(method === "DELETE" ? "Dish deleted." : "Dish updated. The public menu is up to date."); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not update this dish."); }
    finally { busy.current = false; setPending(false); }
  };
  return <>
    <div className="admin-tabs" aria-label="Menu types">{[["", "All dishes"], ["chef-special", "Chef Specials"], ["regular", "Regular dishes"]].map(([value, label]) => <button key={value} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div>
    <div className="admin-toolbar"><input ref={searchInput} aria-label="Search dishes" type="search" placeholder="Search dishes…" value={search} onChange={event => setSearch(event.target.value)} />
      <select aria-label="Category filter" value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.title}{category.kicker ? ` · ${category.kicker}` : ""}</option>)}</select>
      <select aria-label="Availability filter" value={available} onChange={event => setAvailable(event.target.value)}><option value="">Any availability</option><option value="true">Available</option><option value="false">Unavailable</option></select>
      <select aria-label="Visibility filter" value={visible} onChange={event => setVisible(event.target.value)}><option value="">Any visibility</option><option value="true">Visible</option><option value="false">Hidden</option></select>
    </div>
    {notice && <div className="admin-toast" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
    {error && !deleting && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-results"><p className="admin-muted" aria-live="polite">{filtered.length} of {items.length} dishes</p>{(search || category || type || available || visible) && <button className="admin-reset" onClick={() => { setSearch(""); setCategory(""); setType(""); setAvailable(""); setVisible(""); searchInput.current?.focus(); }}>Clear filters</button>}</div>
    <div className="admin-panel admin-table-wrap" aria-busy={pending}><table className="admin-table"><thead><tr>{["Dish", "Category", "Type", "Price", "Availability", "Visibility", "Actions"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{filtered.map(dish => { const category = categories.find(category => category.id === dish.categoryId); return <tr key={dish.id}>
        <td><div className="admin-dish-cell">{dish.image ? <Image src={dish.image} alt="" width={48} height={48} /> : <span className="admin-no-image" aria-label="No image">—</span>}<Link href={`/admin/menu/${dish.id}/edit`}>{dish.name}<small>Order {dish.sortOrder}</small></Link></div></td>
        <td>{category?.title}<small>{category?.kicker}</small></td><td><span className={`admin-badge ${dish.type === "chef-special" ? "gold" : ""}`}>{dish.type === "chef-special" ? "Chef Special" : "Regular"}</span></td><td>{money(dish.priceCents)}</td>
        <td><button disabled={pending} className={`admin-status ${dish.available ? "positive" : ""}`} aria-label={`Toggle availability for ${dish.name}`} aria-pressed={dish.available} onClick={() => void mutate(dish, "PATCH", "available")}>{dish.available ? "Available" : "Unavailable"}</button></td>
        <td><button disabled={pending} className="admin-status" aria-label={`Toggle visibility for ${dish.name}`} aria-pressed={dish.visible} onClick={() => void mutate(dish, "PATCH", "visible")}>{dish.visible ? "Visible" : "Hidden"}</button></td>
        <td><div className="admin-row-actions"><Link href={`/admin/menu/${dish.id}/edit`}>Edit</Link><button disabled={pending} className="admin-danger" onClick={() => { setError(""); setDeleting(dish); }}>Delete</button></div></td>
      </tr>; })}</tbody></table>
      {!filtered.length && <div className="admin-empty"><h2>No dishes found.</h2><p>{items.length ? "Try another filter or search term." : "Add your first dish to get started."}</p><Link href="/admin/menu/new" className="admin-button">Add dish</Link></div>}
    </div>
    <dialog className="admin-dialog" ref={dialog} aria-labelledby="delete-title" onCancel={event => { if (pending) event.preventDefault(); else setDeleting(null); }} onClose={() => setDeleting(null)}>
      <h2 id="delete-title">Delete “{deleting?.name}”?</h2><p>This action cannot be undone.</p>{error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-row-actions"><button autoFocus className="admin-button" disabled={pending} onClick={() => setDeleting(null)}>Cancel</button><button className="admin-button danger" disabled={pending} onClick={() => deleting && void mutate(deleting, "DELETE")}>{pending ? "Deleting…" : "Delete dish"}</button></div>
    </dialog>
  </>;
}
