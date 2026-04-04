import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppHeader } from './components/header';

const tools = [
  {
    to: '/mind-map',
    icon: <img src="/icons/icon.png" alt="Matoriko" className="w-10 h-10" />,
    label: 'mind-map',
    description: 'マインドマップ',
  },
  {
    to: '/mind-memo',
    icon: <img src="/anpan.png" alt="mind-memo" className="w-10 h-10" />,
    label: 'mind-memo',
    description: 'コラム法',
  },
  {
    to: '/night-diary',
    icon: <span className="text-4xl leading-none">🌙</span>,
    label: 'night-diary',
    description: '夜日記',
  },
  {
    to: '/memory',
    icon: <img src="/kamaboko.jpeg" alt="memory" className="w-10 h-10 rounded-md object-cover" />,
    label: 'memory',
    description: '絵日記',
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-header">
        <AppHeader title="Matoriko" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <p className="text-gray-400 text-base tracking-widest text-center mb-8 font-light">自分の心を書き出すメモアプリ</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {tools.map((tool) => (
            <motion.div
              key={tool.to}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={tool.to}
                className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {tool.icon}
                <span className="font-semibold text-gray-900 text-sm">{tool.label}</span>
                <span className="text-xs text-gray-500 text-center">{tool.description}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
