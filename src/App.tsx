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
    icon: <img src="/assets/anpan.png" alt="mind-memo" className="w-10 h-10" />,
    label: 'mind-memo',
    description: '心のもやもやを書くメモ',
  },
  {
    to: '/diary',
    icon: <span className="text-4xl leading-none">🌙</span>,
    label: 'diary',
    description: 'シンプルな日記',
  },
  {
    to: '/memory',
    icon: <img src="/assets/kamaboko.jpeg" alt="memory" className="w-10 h-10 rounded-md object-cover" />,
    label: 'memory',
    description: '絵日記',
  },
  {
    to: '/travel',
    icon: <img src="/assets/travel_anpan.png" alt="travel" className="w-10 h-10" />,
    label: 'travel',
    description: '旅のしおり',
  },
  {
    to: '/message',
    icon: <img src="/assets/anpan/funny.png" alt="message" className="w-10 h-10 object-cover" />,
    label: 'message',
    description: 'メッセージカード',
  },
  {
    to: '/pomodoro',
    icon: <img src="/assets/anpan/funny.png" alt="25timer" className="w-10 h-10 rounded-full object-cover" />,
    label: '25timer',
    description: 'ポモドーロタイマー',
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-header">
        <AppHeader title="Matoriko" subtitle="自分の心を書き出すメモアプリ" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
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
