
import React, { useState } from 'react';

interface Props {
  onGenerate: (data: { recipientName: string; occasion: string; message: string; senderName: string }) => void;
  isGenerating: boolean;
}

const SingleGenerator: React.FC<Props> = ({ onGenerate, isGenerating }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    occasion: 'Happy Birthday!',
    message: 'Wishing you all the best on this special day. May your year be filled with joy, laughter, and endless success.',
    senderName: '',
    fontColor: '',
    fontScale: 100
  });

  const defaultOccasions = [
    'Birthday',
    'Marriage',
    'House Warming',
    'Anniversary',
    'Congratulations',
    'Thank You'
  ];

  const fontSizes = [80, 68, 56, 44, 36]; // preview scale steps for headline-like sizes
  const [customColor, setCustomColor] = useState(formData.fontColor || '#FFFFFF');
  const [customScale, setCustomScale] = useState(formData.fontScale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  }; 

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Recipient Name</label>
        <input
          required
          type="text"
          value={formData.recipientName}
          onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="e.g. Sarah Smith"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Occasion</label>
        <input
          list="occasions-list"
          id="occasion"
          required
          type="text"
          value={formData.occasion}
          onChange={e => setFormData({ ...formData, occasion: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="e.g. Graduation"
        />
        <datalist id="occasions-list">
          {defaultOccasions.map(o => <option key={o} value={o} />)}
        </datalist>
        <p className="text-xs text-slate-400 mt-1">Choose from common occasions or type your own.</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Message</label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
          placeholder="Your heartful message here..."
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">From</label>
        <input
          required
          type="text"
          value={formData.senderName}
          onChange={e => setFormData({ ...formData, senderName: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Your name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Font Color</label>
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              setFormData({ ...formData, fontColor: e.target.value });
              setCustomScale((prev) => prev);
            }}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Font Size (%)</label>
          <input
            type="range"
            min={60}
            max={140}
            value={customScale}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCustomScale(val);
              setFormData({ ...formData, fontScale: val });
            }}
            className="w-full h-10 rounded-lg"
          />
          <div className="text-xs text-slate-400 mt-1">{customScale}%</div>
        </div>
      </div>
      <button
        disabled={isGenerating}
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Generate Personalized Card'}
      </button>
    </form>
  );
};

export default SingleGenerator;
