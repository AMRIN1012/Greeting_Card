
import React, { useState, useMemo, useEffect } from 'react';
import { Template } from '../types';

interface Props {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
  onDataChange?: (data: any) => void;
  selectedTemplate?: Template;
}

const SingleGenerator: React.FC<Props> = ({ onGenerate, isGenerating, onDataChange, selectedTemplate }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    occasion: 'Happy Birthday!',
    message: 'Wishing you all the best on this special day.',
    senderName: '',
    date: '',
    time: '',
    venue: '',
    extra1: '',
    extra2: '',
    fontColor: '#FFFFFF',
    fontScale: 100
  });

  // Calculate field configuration based on template tags
  const fieldConfig = useMemo(() => {
    const tags = selectedTemplate?.tags?.map(t => t.toLowerCase()) || [];

    // Default Configuration (Birthday / Generic)
    let config = {
      recipient: { label: 'Recipient Name', placeholder: 'e.g. Sarah', show: true },
      occasion: { label: 'Occasion', placeholder: 'e.g. Happy Birthday', show: true },
      date: { label: 'Date', placeholder: '', show: false },
      time: { label: 'Time', placeholder: '', show: false },
      venue: { label: 'Venue', placeholder: '', show: false },
      message: { label: 'Message', placeholder: 'Your message...', show: true },
      sender: { label: 'From', placeholder: 'Your name', show: true },
      extra1: { label: '', placeholder: '', show: false },
      extra2: { label: '', placeholder: '', show: false }
    };

    if (tags.includes('wedding')) {
      config = {
        recipient: { label: 'Couple Names', placeholder: 'e.g. Romeo & Juliet', show: true },
        occasion: { label: 'Event Title', placeholder: 'e.g. Wedding Ceremony', show: true },
        date: { label: 'Wedding Date', placeholder: 'e.g. Sunday, 12th Aug', show: true },
        time: { label: 'Time', placeholder: 'e.g. 5:00 PM', show: true },
        venue: { label: 'Venue / Location', placeholder: 'e.g. Grand Plaza Hall', show: true },
        message: { label: 'Invitation Message', placeholder: 'We cordially invite you...', show: true }, // Optional Parent Names could go here or in extra
        sender: { label: 'Hosts / Parents', placeholder: 'e.g. The Smith Family', show: true },
        extra1: { label: 'RSVP', placeholder: 'e.g. RSVP by 20th July', show: true },
        extra2: { label: 'Dress Code / Theme', placeholder: 'e.g. Black Tie', show: true }
      };
    } else if (tags.includes('engagement')) {
      config = {
        recipient: { label: 'Couple Names', placeholder: 'e.g. Romeo & Juliet', show: true },
        occasion: { label: 'Event Title', placeholder: 'e.g. Engagement Ceremony', show: true },
        date: { label: 'Date', placeholder: 'e.g. 12th Aug', show: true },
        time: { label: 'Time', placeholder: 'e.g. 7:00 PM', show: true },
        venue: { label: 'Venue', placeholder: 'e.g. City Garden', show: true },
        message: { label: 'Invitation Message', placeholder: 'Join us to celebrate...', show: true },
        sender: { label: 'Hosts', placeholder: 'e.g. The Families', show: true },
        extra1: { label: 'RSVP', placeholder: 'e.g. 555-1234', show: true },
        extra2: { label: '', placeholder: '', show: false }
      };
    } else if (tags.includes('certificate')) {
      config = {
        recipient: { label: 'Recipient Name', placeholder: 'e.g. John Doe', show: true },
        occasion: { label: 'Award Title', placeholder: 'e.g. Best Employee', show: true },
        date: { label: 'Date', placeholder: 'e.g. 2023-10-25', show: true },
        time: { label: '', placeholder: '', show: false },
        venue: { label: '', placeholder: '', show: false },
        message: { label: 'Citation / Description', placeholder: 'For outstanding performance...', show: true },
        sender: { label: 'Issuer / Organization', placeholder: 'e.g. Tech Corp', show: true },
        extra1: { label: 'Signature Name', placeholder: 'e.g. CEO Name', show: true },
        extra2: { label: '', placeholder: '', show: false }
      };
    } else if (tags.includes('baby') || tags.includes('baby shower')) {
      config = {
        recipient: { label: 'Parent(s) Names', placeholder: 'e.g. Sarah & Mike', show: true },
        occasion: { label: 'Event Name', placeholder: 'e.g. Baby Shower', show: true },
        date: { label: 'Date', placeholder: 'e.g. Sat, 15th July', show: true },
        time: { label: 'Time', placeholder: 'e.g. 2:00 PM', show: true },
        venue: { label: 'Venue', placeholder: 'e.g. 123 Maple St', show: true },
        message: { label: 'Message', placeholder: 'Join us to welcome...', show: true },
        sender: { label: 'RSVP / Contact', placeholder: 'e.g. 555-0101', show: true },
        extra1: { label: 'Theme / Registry', placeholder: 'e.g. Jungle Theme', show: true },
        extra2: { label: '', placeholder: '', show: false }
      };
    } else if (tags.includes('islamic')) {
      config = {
        recipient: { label: 'Recipient / Couple', placeholder: 'e.g. Ahmed & Fatima', show: true },
        occasion: { label: 'Title / Bismillah', placeholder: 'e.g. Walima Invitation', show: true },
        date: { label: 'Date', placeholder: '', show: true },
        time: { label: 'Time', placeholder: '', show: true },
        venue: { label: 'Venue', placeholder: '', show: true },
        message: { label: 'Message / Dua', placeholder: 'Requesting your prayers...', show: true },
        sender: { label: 'From / Family', placeholder: 'e.g. The Khan Family', show: true },
        extra1: { label: '', placeholder: '', show: false },
        extra2: { label: '', placeholder: '', show: false }
      };
    }

    return config;
  }, [selectedTemplate?.id]);

  // Reset/Adjust default values when template type changes
  useEffect(() => {
    if (selectedTemplate) {
      const tags = selectedTemplate.tags?.map(t => t.toLowerCase()) || [];

      let newOccasion = 'Happy Birthday!';
      let newMessage = 'Wishing you all the best on this special day.';

      if (tags.includes('certificate')) {
        newOccasion = 'Certificate of Achievement';
        newMessage = 'For outstanding dedication and performance.';
      } else if (tags.includes('wedding')) {
        newOccasion = 'Wedding Invitation';
        newMessage = 'Together with our families, we invite you to celebrate our love.';
      } else if (tags.includes('engagement')) {
        newOccasion = 'Engagement Ceremony';
        newMessage = 'We are happy to announce our engagement.';
      } else if (tags.includes('baby')) {
        newOccasion = 'Baby Shower';
        newMessage = 'Join us to celebrate the upcoming arrival.';
      }

      setFormData(prev => ({
        ...prev,
        occasion: newOccasion,
        message: newMessage,
        // Reset detailed fields to avoid mixing contexts
        date: '',
        time: '',
        venue: '',
        extra1: '',
        extra2: ''
      }));
    }
  }, [selectedTemplate?.id]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const [customColor, setCustomColor] = useState(formData.fontColor || '#FFFFFF');
  const [customScale, setCustomScale] = useState(formData.fontScale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const inputStyle = "w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-100 focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500/50 outline-none transition-all";
  const labelStyle = "block text-xs font-semibold text-slate-300 uppercase mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Content</h3>
        <div className="space-y-4">
          {/* Recipient */}
          {fieldConfig.recipient.show && (
            <div>
              <label className={labelStyle}>{fieldConfig.recipient.label}</label>
              <input
                required
                type="text"
                value={formData.recipientName}
                onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                className={inputStyle}
                placeholder={fieldConfig.recipient.placeholder}
              />
            </div>
          )}

          {/* Occasion / Title */}
          {fieldConfig.occasion.show && (
            <div>
              <label className={labelStyle}>{fieldConfig.occasion.label}</label>
              <input
                required
                type="text"
                value={formData.occasion}
                onChange={e => setFormData({ ...formData, occasion: e.target.value })}
                className={inputStyle}
                placeholder={fieldConfig.occasion.placeholder}
              />
            </div>
          )}

          {/* Date & Time Row */}
          {(fieldConfig.date.show || fieldConfig.time.show) && (
            <div className="flex gap-4">
              {fieldConfig.date.show && (
                <div className="flex-1">
                  <label className={labelStyle}>{fieldConfig.date.label}</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputStyle}
                    placeholder={fieldConfig.date.placeholder}
                  />
                </div>
              )}
              {fieldConfig.time.show && (
                <div className="flex-1">
                  <label className={labelStyle}>{fieldConfig.time.label}</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className={inputStyle}
                    placeholder={fieldConfig.time.placeholder}
                  />
                </div>
              )}
            </div>
          )}

          {/* Venue */}
          {fieldConfig.venue.show && (
            <div>
              <label className={labelStyle}>{fieldConfig.venue.label}</label>
              <input
                type="text"
                value={formData.venue}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                className={inputStyle}
                placeholder={fieldConfig.venue.placeholder}
              />
            </div>
          )}

          {/* Message */}
          {fieldConfig.message.show && (
            <div>
              <label className={labelStyle}>{fieldConfig.message.label}</label>
              <textarea
                required
                rows={3}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className={`${inputStyle} resize-none`}
                placeholder={fieldConfig.message.placeholder}
              />
            </div>
          )}

          {/* Sender / Host */}
          {fieldConfig.sender.show && (
            <div>
              <label className={labelStyle}>{fieldConfig.sender.label}</label>
              <input
                required
                type="text"
                value={formData.senderName}
                onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                className={inputStyle}
                placeholder={fieldConfig.sender.placeholder}
              />
            </div>
          )}

          {/* Extras Row */}
          {(fieldConfig.extra1.show || fieldConfig.extra2.show) && (
            <div className="grid grid-cols-2 gap-4">
              {fieldConfig.extra1.show && (
                <div>
                  <label className={labelStyle}>{fieldConfig.extra1.label}</label>
                  <input
                    type="text"
                    value={formData.extra1}
                    onChange={e => setFormData({ ...formData, extra1: e.target.value })}
                    className={inputStyle}
                    placeholder={fieldConfig.extra1.placeholder}
                  />
                </div>
              )}
              {fieldConfig.extra2.show && (
                <div>
                  <label className={labelStyle}>{fieldConfig.extra2.label}</label>
                  <input
                    type="text"
                    value={formData.extra2}
                    onChange={e => setFormData({ ...formData, extra2: e.target.value })}
                    className={inputStyle}
                    placeholder={fieldConfig.extra2.placeholder}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Styling</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Font Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setFormData({ ...formData, fontColor: e.target.value });
                  setCustomScale((prev) => prev);
                }}
                className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-xs text-slate-400 font-mono">{customColor}</span>
            </div>
          </div>
          <div>
            <label className={labelStyle}>Font Size</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={60}
                max={140}
                step={5}
                value={customScale}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomScale(val);
                  setFormData({ ...formData, fontScale: val });
                }}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs text-slate-400 min-w-[3rem] text-right">{customScale}%</span>
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={isGenerating}
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Card'
        )}
      </button>
    </form>
  );
};

export default SingleGenerator;
