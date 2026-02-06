import React from 'react';
import { GeneratedCard } from '../types';
import { InteractiveCard } from './InteractiveCard';

interface Props {
  cards: GeneratedCard[];
  onUpdate: (card: GeneratedCard) => void;
}

const PreviewGrid: React.FC<Props> = ({ cards, onUpdate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => (
        <InteractiveCard key={card.id} card={card} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default PreviewGrid;
