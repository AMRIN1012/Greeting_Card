import React from 'react';
import { GeneratedCard } from '../types';
import { InteractiveCard } from './InteractiveCard';

interface Props {
  cards: GeneratedCard[];
  onUpdate: (card: GeneratedCard) => void;
}

const PreviewGrid: React.FC<Props> = ({ cards, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
      {cards.map((card) => (
        <div key={card.id} className="group relative transition-all duration-300 hover:-translate-y-1 h-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500"></div>
          <div className="relative h-full">
            <InteractiveCard card={card} onUpdate={onUpdate} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PreviewGrid;
