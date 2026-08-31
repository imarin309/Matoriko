import { useState } from 'react';
import type { FormEvent } from 'react';
import { MURMUR_INPUT_LABEL, MURMUR_PLACEHOLDER, MURMUR_SEND_LABEL } from './murmurs';

interface MurmurComposerProps {
  onSend: (text: string) => void;
}

/** 一言を送る入力欄。空のまま押しても、何も言わずに何も起きない */
export function MurmurComposer({ onSend }: MurmurComposerProps) {
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onSend(text);
    setText('');
  };

  return (
    <form className="murmur-compose" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={MURMUR_PLACEHOLDER}
        aria-label={MURMUR_INPUT_LABEL}
        enterKeyHint="send"
        autoComplete="off"
        className="murmur-input"
      />
      <button type="submit" className="murmur-send">
        {MURMUR_SEND_LABEL}
      </button>
    </form>
  );
}
