'use client';
import { useEffect, useState } from 'react';
import { useLang } from '@/providers/LangProvider';
import { useCategories } from '@/lib/useCategories';
import { OPTS, ALL_METAL, ALL_MADERA, ALL_MEDIDA, type OptAxis } from '@/lib/opts';
import { createProduct, updateProduct } from '@/lib/products';
import { uploadImage } from '@/lib/orders';
import { ApiError, imageUrl } from '@/lib/api';
import { IconImage, IconClose, IconCube } from '@/components/icons';
import type { Product, ProductInput } from '@/lib/types';

const AXES: OptAxis[] = ['metal', 'madera', 'medida'];
const ALL: Record<OptAxis, string[]> = { metal: ALL_METAL, madera: ALL_MADERA, medida: ALL_MEDIDA };

interface Props {
  editing?: Product | null;
  onSaved: (p: Product, created: boolean) => void;
  onCancel?: () => void;
}

function emptyState() {
  return {
    name: '', price: '', dims: '', categoryId: '',
    materialsEs: '', materialsEn: '', descriptionEs: '', descriptionEn: '',
    imageIds: [] as string[],
    customization: { metal: [...ALL_METAL], madera: [...ALL_MADERA], medida: [...ALL_MEDIDA] } as Record<OptAxis, string[]>,
    internalCost: '', workshopNotes: '', supplierRef: '',
  };
}

export default function ProductForm({ editing, onSaved, onCancel }: Props) {
  const { t, lang } = useLang();
  const { cats } = useCategories();
  const [f, setF] = useState(emptyState());
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setF({
        name: editing.name, price: String(editing.price), dims: editing.dims, categoryId: editing.categoryId,
        materialsEs: editing.materialsEs, materialsEn: editing.materialsEn,
        descriptionEs: editing.descriptionEs, descriptionEn: editing.descriptionEn,
        imageIds: [...editing.imageIds],
        customization: {
          metal: editing.customization.metal.length ? [...editing.customization.metal] : [],
          madera: editing.customization.madera.length ? [...editing.customization.madera] : [],
          medida: editing.customization.medida.length ? [...editing.customization.medida] : [],
        },
        internalCost: editing.admin ? String(editing.admin.internalCost) : '',
        workshopNotes: editing.admin?.workshopNotes || '',
        supplierRef: editing.admin?.supplierRef || '',
      });
    } else {
      setF(emptyState());
    }
    setError('');
  }, [editing]);

  function toggleOpt(axis: OptAxis, v: string) {
    setF((s) => {
      const cur = s.customization[axis];
      const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
      return { ...s, customization: { ...s.customization, [axis]: next } };
    });
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const res = await uploadImage(file);
        setF((s) => ({ ...s, imageIds: [...s.imageIds, res.id] }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.code : t.adm_err_save);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(id: string) {
    setF((s) => ({ ...s, imageIds: s.imageIds.filter((x) => x !== id) }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const price = parseInt(f.price, 10);
    if (!f.name.trim() || !f.categoryId || !price || price <= 0) {
      setError(t.acc_err_input);
      return;
    }
    const input: ProductInput = {
      name: f.name.trim(),
      categoryId: f.categoryId,
      price,
      dims: f.dims.trim(),
      materialsEs: f.materialsEs.trim(),
      materialsEn: f.materialsEn.trim(),
      descriptionEs: f.descriptionEs.trim(),
      descriptionEn: f.descriptionEn.trim(),
      imageIds: f.imageIds,
      customization: f.customization,
      admin: {
        internalCost: parseInt(f.internalCost, 10) || 0,
        workshopNotes: f.workshopNotes.trim(),
        supplierRef: f.supplierRef.trim(),
      },
    };
    setBusy(true);
    try {
      const saved = editing ? await updateProduct(editing.id, input) : await createProduct(input);
      onSaved(saved, !editing);
      if (!editing) setF(emptyState());
    } catch (err) {
      setError(err instanceof ApiError ? `${t.adm_err_save} (${err.code})` : t.adm_err_save);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 22 }}>
      {/* 1. Información básica */}
      <Section n={1} title={t.adm_section_basic}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <L label={t.adm_f_name}><input className="alv-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ej. Mesa Fábrica" /></L>
          <L label={t.adm_f_price}><input className="alv-input" type="number" min={1} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="1890000" /></L>
          <L label={t.adm_f_dims}><input className="alv-input" value={f.dims} onChange={(e) => setF({ ...f, dims: e.target.value })} placeholder="180 × 90 × 76 cm" /></L>
          <L label={t.adm_f_category}>
            <select className="alv-input" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value })}>
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{lang === 'es' ? c.nameEs : c.nameEn}</option>)}
            </select>
          </L>
          <L label={t.adm_f_mat_es}><input className="alv-input" value={f.materialsEs} onChange={(e) => setF({ ...f, materialsEs: e.target.value })} placeholder="Roble · Hierro fundido" /></L>
          <L label={t.adm_f_mat_en}><input className="alv-input" value={f.materialsEn} onChange={(e) => setF({ ...f, materialsEn: e.target.value })} placeholder="Oak · Cast iron" /></L>
        </div>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr', marginTop: 14 }}>
          <L label={t.adm_f_desc_es}><textarea className="alv-input" rows={2} value={f.descriptionEs} onChange={(e) => setF({ ...f, descriptionEs: e.target.value })} style={{ resize: 'vertical' }} /></L>
          <L label={t.adm_f_desc_en}><textarea className="alv-input" rows={2} value={f.descriptionEn} onChange={(e) => setF({ ...f, descriptionEn: e.target.value })} style={{ resize: 'vertical' }} /></L>
        </div>
      </Section>

      {/* 2. Imágenes */}
      <Section n={2} title={t.adm_section_images}>
        <label style={{ border: '2px dashed var(--alv-line)', borderRadius: 16, padding: 26, textAlign: 'center', display: 'block', cursor: 'pointer', background: 'var(--alv-panel)' }}>
          <div style={{ color: '#8c8c8c', display: 'grid', placeItems: 'center', gap: 8 }}>
            <IconImage size={28} />
            <span style={{ fontSize: 14 }}>{uploading ? t.adm_uploading : t.adm_images_hint}</span>
          </div>
          <span className="alv-btn-dark" style={{ marginTop: 14, pointerEvents: 'none' }}>{t.adm_images_btn}</span>
          <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        </label>
        {f.imageIds.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            {f.imageIds.map((id) => (
              <div key={id} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(id)} alt="" style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--alv-line)' }} />
                <button type="button" onClick={() => removeImage(id)} aria-label="Quitar" style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 999, border: 'none', background: '#141414', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><IconClose size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 3. Personalización */}
      <Section n={3} title={t.adm_section_custom} sub={t.adm_section_custom_sub}>
        {AXES.map((axis) => (
          <div key={axis} style={{ marginBottom: 14 }}>
            <div className="alv-label" style={{ marginBottom: 8 }}>{OPTS[axis][lang]}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL[axis].map((v) => {
                const choice = OPTS[axis].opts.find((o) => o.v === v)!;
                return (
                  <button key={v} type="button" className="alv-chip" data-active={f.customization[axis].includes(v)} onClick={() => toggleOpt(axis, v)}>
                    {choice[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      {/* 4. Campos internos (admin) */}
      <Section n={4} title={t.adm_admin_fields} icon={<IconCube size={16} />}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <L label={t.adm_cost}><input className="alv-input" type="number" value={f.internalCost} onChange={(e) => setF({ ...f, internalCost: e.target.value })} placeholder="700000" /></L>
          <L label={t.adm_supplier}><input className="alv-input" value={f.supplierRef} onChange={(e) => setF({ ...f, supplierRef: e.target.value })} placeholder="SUP-9" /></L>
          <L label={t.adm_notes}><input className="alv-input" value={f.workshopNotes} onChange={(e) => setF({ ...f, workshopNotes: e.target.value })} /></L>
        </div>
      </Section>

      {error && <p style={{ color: '#b3261e', fontSize: 14 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" className="alv-btn-gold" disabled={busy || uploading}>{busy ? t.adm_creating : editing ? t.adm_update : t.adm_create}</button>
        {editing && onCancel && <button type="button" className="alv-btn-dark" onClick={onCancel}>{t.adm_cancel}</button>}
      </div>
    </form>
  );
}

function Section({ n, title, sub, icon, children }: { n: number; title: string; sub?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--alv-line)', borderRadius: 18, padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--alv-panel)', color: '#141414', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{icon || n}</span>
        <span className="font-display" style={{ fontWeight: 700, fontSize: 18, color: '#141414' }}>{title}</span>
      </div>
      {sub && <p style={{ color: '#8c8c8c', fontSize: 13.5, marginTop: 6, marginLeft: 36 }}>{sub}</p>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span className="alv-label" style={{ display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}
