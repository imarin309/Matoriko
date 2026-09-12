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
    <div className="w-full flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.button
            key={tag.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onTagClick(tag)}
            className="text-base text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap"
          >
            #{tag.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};
