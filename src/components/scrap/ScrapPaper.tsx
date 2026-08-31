import { SCRAP_INPUT_LABEL } from './scrap';

interface ScrapPaperProps {
  text: string;
  /** 丸めている最中。この間は書き足せない */
  crumpling: boolean;
  onChange: (text: string) => void;
}

/**
 * 書く場所。問いも見出しも文字数も置かない、ただの紙。
 * 丸まって飛んでいく動きは CSS 側（scrap-crumpling）に持たせている。
 */
export function ScrapPaper({ text, crumpling, onChange }: ScrapPaperProps) {
  return (
    <div className={crumpling ? 'scrap-sheet scrap-crumpling' : 'scrap-sheet'}>
      <div className="scrap-paper">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          aria-label={SCRAP_INPUT_LABEL}
          readOnly={crumpling}
          spellCheck={false}
          className="scrap-input"
        />
      </div>
    </div>
  );
}
