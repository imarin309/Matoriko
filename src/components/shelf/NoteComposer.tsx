import { useState } from 'react';
import type { FormEvent } from 'react';
import { SHELF_ADD_LABEL, SHELF_PLACEHOLDER } from './boxes';

interface NoteComposerProps {
  onAdd: (text: string) => void;
}

/** 付箋を1枚足すだけの入力欄。空のまま押しても、何も言わずに何も起きない */
export function NoteComposer({ onAdd }: NoteComposerProps) {
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onAdd(text);
    setText('');
  };

  return (
    <form className="shelf-compose" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={SHELF_PLACEHOLDER}
        aria-label="今おもってることを書く"
        maxLength={60}
        enterKeyHint="done"
        className="shelf-input"
      />
      <button type="submit" className="shelf-add">
        {SHELF_ADD_LABEL}
      </button>
    </form>
  );
}
