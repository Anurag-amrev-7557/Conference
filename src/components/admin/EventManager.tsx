import React, { useState } from 'react';
import { useWebsiteData } from '../WebsiteDataProvider';
import type { AppEvent } from '../../lib/websiteData';
import { Plus, Edit2, Trash2, MapPin, User, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export const EventManager: React.FC = () => {
  const { data, createEvent, updateEvent, deleteEvent } = useWebsiteData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AppEvent>>({});

  const handleEdit = (event: AppEvent) => {
    setEditingId(event.id);
    setEditForm(event);
  };

  const handleAddNew = async () => {
    const newEvent: Partial<AppEvent> = {
      day: '12 Apr',
      weekday: 'Sunday',
      time: '18:00',
      full_time: '12 Apr, 18:00 GMT-7',
      title: 'New Event Title',
      host: 'New Host',
      location: 'New Location',
      tags: [{ name: 'NEW', color: 'bg-zinc-50 text-zinc-600 border-zinc-100' }],
      price: 'Free',
      thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop',
      status: 'Upcoming',
      isPublished: false,
      lat: 37.7749,
      lng: -122.4194
    };
    
    try {
      await createEvent(newEvent);
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
      } catch (err) {
        alert('Failed to delete event');
      }
    }
  };

  const handleSave = async () => {
    if (editingId) {
      try {
        await updateEvent(editingId, editForm);
        setEditingId(null);
      } catch (err) {
        alert('Failed to save event');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-serif italic text-text">Manage Events</h3>
          <p className="text-sm text-muted">Curate the upcoming workshops and networking events.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="space-y-4">
        {data.events.map((event) => (
          <motion.div
            key={event.id}
            layoutId={event.id}
            className="bg-white rounded-[24px] overflow-hidden border border-border/40 shadow-sm"
          >
            {editingId === event.id ? (
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Event Title</label>
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Day (e.g. 9 Apr)</label>
                        <input type="text" value={editForm.day || ''} onChange={e => setEditForm({ ...editForm, day: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Weekday</label>
                        <input type="text" value={editForm.weekday || ''} onChange={e => setEditForm({ ...editForm, weekday: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Time (17:30)</label>
                        <input type="text" value={editForm.time || ''} onChange={e => setEditForm({ ...editForm, time: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Price</label>
                        <input type="text" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Host Name</label>
                      <input type="text" value={editForm.host || ''} onChange={e => setEditForm({ ...editForm, host: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Location</label>
                      <input type="text" value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Thumbnail URL</label>
                      <input type="text" value={editForm.thumbnail || ''} onChange={e => setEditForm({ ...editForm, thumbnail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:border-accent outline-none" />
                    </div>
                    <div className="flex gap-4 pt-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                           type="radio" 
                           checked={editForm.status === 'Upcoming'} 
                           onChange={() => setEditForm({ ...editForm, status: 'Upcoming' })}
                         />
                         <span className="text-sm">Upcoming</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input 
                           type="radio" 
                           checked={editForm.status === 'Past'} 
                           onChange={() => setEditForm({ ...editForm, status: 'Past' })}
                         />
                         <span className="text-sm">Past</span>
                       </label>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-off/50 rounded-xl border border-border/40 mt-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={editForm.isPublished || false}
                          onChange={e => setEditForm({ ...editForm, isPublished: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        <span className="ms-3 text-sm font-bold text-text uppercase tracking-widest">Mark as Live</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleSave} className="flex-1 py-3 bg-accent text-white rounded-xl font-bold">Save Changes</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-3 border border-border text-text rounded-xl font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={event.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{event.day} · {event.weekday}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${event.status === 'Upcoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>{event.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${event.isPublished ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      {event.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <h4 className="text-xl font-serif text-text truncate mb-2">{event.title}</h4>
                  <div className="flex items-center gap-6 text-xs text-muted">
                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />By {event.host}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.location}</div>
                    <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{event.price}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleEdit(event)} className="p-3 text-muted hover:text-accent hover:bg-accent/5 rounded-xl transition-all"><Edit2 className="w-5 h-5" /></button>
                   <button onClick={() => handleDelete(event.id)} className="p-3 text-muted hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
