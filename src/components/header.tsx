import { Link } from 'react-router-dom';
import { AppLauncher } from './AppLauncher';

interface AppHeaderProps {
  title: string;
  isSubPage?: boolean;
}

export function AppHeader({ title, isSubPage = false }: AppHeaderProps) {
  return (
    <div className="app-header-container">
      <div className="flex items-center gap-3">
        {isSubPage ? (
          <Link
            to="/"
            aria-label="Matoriko トップへ"
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-all shrink-0"
          >
            <img src="/icons/icon.png" alt="Matriko" className="w-9 h-9" />
          </Link>
        ) : (
          <img src="/icons/icon.png" alt="アイコン" className="w-9 h-9" />
        )}
        <h1 className="app-title">{title}</h1>
      </div>
      <AppLauncher />
    </div>
  );
}
