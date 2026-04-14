import React, { useState } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { Palette, Type, Save } from 'lucide-react';

export const AppearanceManager: React.FC = () => {
  const { data, updateAppearance } = useWebsiteData();
  const [form, setForm] = useState(data.appearance);

  const handleSave = () => {
    updateAppearance(form);
    alert('Appearance settings saved! Refresh the page if colors do not update immediately.');
  };

  const colors = [
    { name: 'Classic Blue', hex: '#0052cc' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Slate', hex: '#334155' },
    { name: 'Violet', hex: '#7c3aed' },
    { name: 'Teal', hex: '#0d9488' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* THEME COLORS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Theme & Colors</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 block">Primary Accent Color</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
              {colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setForm({ ...form, primaryColor: color.hex })}
                  className={`group relative h-12 rounded-xl transition-all ${
                    form.primaryColor === color.hex ? 'ring-2 ring-offset-2 ring-accent' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] bg-black/20 text-white px-2 py-1 rounded font-bold uppercase">{color.name}</span>
                  </span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-off/50 border border-border/40">
              <input
                type="color"
                value={form.primaryColor}
                onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-none bg-transparent"
              />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Custom Hex Code</label>
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-sm font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRANDING */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Type className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Branding & Identity</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Brand Name</label>
              <input
                type="text"
                value={form.brandName}
                onChange={e => setForm({ ...form, brandName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Brand Logo Text</label>
              <input
                type="text"
                maxLength={2}
                value={form.brandLogoText}
                onChange={e => setForm({ ...form, brandLogoText: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none font-serif italic text-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent2 transition-all shadow-xl shadow-accent/20"
        >
          <Save className="w-5 h-5" />
          Apply Appearance
        </button>
      </div>
    </div>
  );
};
