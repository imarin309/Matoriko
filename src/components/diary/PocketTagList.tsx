import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PocketTagData } from './pocket-tag-types';

interface PocketTagListProps {
  tags: PocketTagData[];
  onTagClick: (tag: PocketTagData) => void;
}

export const PocketTagList: React.FC<PocketTagListProps> = ({ tags, onTagClick }) => {
  if (tags.length === 0) return null;

  return (
    <div className="w-full flex flex-wrap gap-2 justify-center p-4 relative z-10">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.button
            key={tag.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onTagClick(tag)}
            className={`px-4 py-1.5 rounded-full text-sm border border-white/50 shadow-sm backdrop-blur-sm whitespace-nowrap ${tag.color} text-gray-700 hover:scale-105 active:scale-95 transition-transform`}
          >
            #{tag.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};
