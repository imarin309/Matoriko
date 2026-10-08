import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PomodoroPage } from '../pages/PomodoroPage';

// vitest の globals を使っていないため、自動クリーンアップは効かない
afterEach(cleanup);

function renderPage() {
  return render(
    <MemoryRouter>
      <PomodoroPage />
    </MemoryRouter>
  );
}

describe('PomodoroPage', () => {
  it('開いたときは作業25分', () => {
    renderPage();

    expect(screen.getByRole('button', { name: '作業' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('休憩を選ぶと休憩の時間になる', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '休憩' }));

    expect(screen.getByRole('button', { name: '休憩' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('時間はフェーズごとに覚えておく', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '1分長くする' }));
    expect(screen.getByText('26:00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '休憩' }));
    fireEvent.click(screen.getByRole('button', { name: '1分短くする' }));
    expect(screen.getByText('04:00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '作業' }));
    expect(screen.getByText('26:00')).toBeInTheDocument();
  });

  it('1分より短くはできない', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '休憩' }));

    const shorten = screen.getByRole('button', { name: '1分短くする' });
    for (let i = 0; i < 10; i++) fireEvent.click(shorten);

    expect(screen.getByText('01:00')).toBeInTheDocument();
    expect(shorten).toBeDisabled();
  });
});
