import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SOLID_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#34d399',
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#94a3b8',
  '#1e293b', '#0f172a',
];

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  'linear-gradient(135deg, #cc2b5e 0%, #753a88 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
];

const SCENES = [
  'linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)',
  'radial-gradient(ellipse at top, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #e94560 100%)',
  'radial-gradient(circle at 20% 80%, #120078 0%, #9d0191 50%, #fd3a69 100%)',
  'linear-gradient(to right, #141e30, #243b55)',
  'linear-gradient(to bottom, #2d1b69, #11998e)',
  'radial-gradient(ellipse at center, #2c3e50 0%, #bdc3c7 100%)',
  'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
];

type Tab = 'color' | 'gradient' | 'scene' | 'upload';

export default function CoverPicker({ onSelect, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('gradient');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'gradient', label: 'Gradient' },
    { key: 'color', label: 'Màu sắc' },
    { key: 'scene', label: 'Cảnh nền' },
    { key: 'upload', label: 'Tải lên' },
  ];

  return (
    <div
      className="modal-backdrop fixed inset-0 z-80 flex items-center justify-center p-4"
      style={{ background: 'rgba(27,48,34,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="modal-panel w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-serif text-base font-semibold" style={{ color: 'var(--color-forest)' }}>
            Chọn Cover
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
              style={{
                background: tab === t.key ? 'var(--color-forest)' : 'transparent',
                color: tab === t.key ? 'var(--color-cream)' : 'var(--text-muted)',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 pt-3">
          {tab === 'color' && (
            <div className="grid grid-cols-6 gap-2">
              {SOLID_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onSelect(c)}
                  className="w-full aspect-square rounded-xl border-2 border-transparent hover:scale-105"
                  style={{ background: c, transition: 'border-color 0.12s ease, transform 0.12s ease, box-shadow 0.12s ease' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-terracotta)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                />
              ))}
            </div>
          )}

          {tab === 'gradient' && (
            <div className="grid grid-cols-2 gap-2">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(g)}
                  className="w-full h-16 rounded-xl hover:scale-[1.03]"
                  style={{ background: g, transition: 'transform 0.12s ease, box-shadow 0.12s ease' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-terracotta)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                />
              ))}
            </div>
          )}

          {tab === 'scene' && (
            <div className="grid grid-cols-2 gap-2">
              {SCENES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(s)}
                  className="w-full h-16 rounded-xl hover:scale-[1.03]"
                  style={{ background: s, transition: 'transform 0.12s ease, box-shadow 0.12s ease' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-terracotta)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                />
              ))}
            </div>
          )}

          {tab === 'upload' && (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-terracotta)'; e.currentTarget.style.color = 'var(--color-terracotta)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Upload size={20} />
              <div className="text-center">
                <p className="text-sm font-medium">Nhấn để chọn ảnh</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WEBP</p>
              </div>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
