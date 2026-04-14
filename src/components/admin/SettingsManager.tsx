import React, { useState } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import { Globe, Settings2, Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { data, updateSettings } = useWebsiteData();
  const [form, setForm] = useState(data.settings);

  const handleSave = () => {
    updateSettings(form);
    alert('Settings saved successfully!');
  };

  const addNavLink = () => {
    const id = Date.now().toString();
    setForm({
      ...form,
      navigation: {
        ...form.navigation,
        links: [...form.navigation.links, { id, name: 'New Link', href: '#' }]
      }
    });
  };

  const removeNavLink = (id: string) => {
    setForm({
      ...form,
      navigation: {
        ...form.navigation,
        links: form.navigation.links.filter(l => l.id !== id)
      }
    });
  };

  const updateNavLink = (id: string, field: 'name' | 'href', value: string) => {
    setForm({
      ...form,
      navigation: {
        ...form.navigation,
        links: form.navigation.links.map(l => l.id === id ? { ...l, [field]: value } : l)
      }
    });
  };

  const toggleVisibility = (key: keyof typeof form.visibility) => {
    setForm({
      ...form,
      visibility: {
        ...form.visibility,
        [key]: !form.visibility[key]
      }
    });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* SEO SETTINGS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">SEO & Meta Tags</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Site Browser Title</label>
              <input
                type="text"
                value={form.seo.title}
                onChange={e => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Meta Description</label>
              <textarea
                rows={3}
                value={form.seo.description}
                onChange={e => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION SETTINGS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Navigation Menu</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm space-y-6">
          <div className="space-y-4">
            {form.navigation.links.map((link) => (
              <div key={link.id} className="flex gap-4 items-center p-4 rounded-xl bg-off/50 border border-border/40">
                <div className="flex-1">
                  <input
                    type="text"
                    value={link.name}
                    onChange={e => updateNavLink(link.id, 'name', e.target.value)}
                    placeholder="Link Name"
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-sm bg-white"
                  />
                </div>
                <div className="flex-[2]">
                  <input
                    type="text"
                    value={link.href}
                    onChange={e => updateNavLink(link.id, 'href', e.target.value)}
                    placeholder="URL (e.g. #blog or /about)"
                    className="w-full px-3 py-2 rounded-lg border border-border focus:border-accent outline-none text-sm bg-white"
                  />
                </div>
                <button
                  onClick={() => removeNavLink(link.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addNavLink}
            className="flex items-center gap-2 px-6 py-2 border border-dashed border-border hover:border-accent hover:text-accent rounded-xl text-sm font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>
      </section>

      {/* VISIBILITY SETTINGS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Eye className="w-4 h-4 text-accent" />
          </div>
          <h3 className="text-xl font-serif italic text-text">Section Visibility</h3>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-border/40 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(form.visibility).map(([key, isVisible]) => (
              <button
                key={key}
                onClick={() => toggleVisibility(key as any)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isVisible 
                    ? 'bg-accent/5 border-accent/20 text-accent font-bold' 
                    : 'bg-white border-border text-muted'
                }`}
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-10 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent2 transition-all shadow-xl shadow-accent/20"
        >
          <Save className="w-5 h-5" />
          Save All Settings
        </button>
      </div>
    </div>
  );
};
