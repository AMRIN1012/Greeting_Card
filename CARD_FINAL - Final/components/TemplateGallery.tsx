
import React from 'react';
import { TEMPLATES } from '../constants';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

const TemplateGallery: React.FC<Props> = ({ selectedId, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto py-2">
      {TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onSelect(tpl.id)}
          className={`group relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 w-40 h-40 ${
            selectedId === tpl.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent'
          }`}
        >
          <img
            src={tpl.bgUrl}
            alt={tpl.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {/* Overlay with improved contrast so names are readable on light/dark templates */}
          <div className="absolute bottom-2 left-2 right-2 p-0 text-xs text-center">
            <div className="inline-block max-w-full truncate bg-black/60 text-white rounded-md py-1 px-2 text-xs font-bold uppercase tracking-wider shadow-sm">
              {tpl.name}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TemplateGallery;
