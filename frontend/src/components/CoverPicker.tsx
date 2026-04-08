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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 text-xs font-medium transition-colors"
              style={{
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: tab === t.key ? '2px solid var(--text-primary)' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'color' && (
            <div className="grid grid-cols-6 gap-2">
              {SOLID_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onSelect(c)}
                  className="w-full aspect-square rounded-md border-2 border-transparent hover:border-white transition-all"
                  style={{ background: c }}
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
                  className="w-full h-16 rounded-md border-2 border-transparent hover:border-white transition-all"
                  style={{ background: g }}
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
                  className="w-full h-16 rounded-md border-2 border-transparent hover:border-white transition-all"
                  style={{ background: s }}
                />
              ))}
            </div>
          )}

          {tab === 'upload' && (
            <div
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Upload size={20} />
              <p className="text-sm">Nhấn để chọn ảnh</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WEBP</p>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
