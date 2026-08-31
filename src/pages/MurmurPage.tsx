import { useState } from 'react';
import { AppHeader } from '../components/header';
import { MurmurActions } from '../components/murmur/MurmurActions';
import { MurmurAnpan } from '../components/murmur/MurmurAnpan';
import { MurmurComposer } from '../components/murmur/MurmurComposer';
import { MurmurStream } from '../components/murmur/MurmurStream';
import { addMurmur, type Murmur } from '../components/murmur/murmurs';
import { downloadMurmurText } from '../components/murmur/downloadMurmurText';

/**
 * 一言ずつ、送るように書くページ。
 * 返事は返ってこない（あいづちも、入力中の表示も、相手側の吹き出しも作らない）。
 * 書いたものはこの画面から離れると消える。残したいときだけ save で書き出す。
 * 終わり方は用意しない。書きたいだけ書いて、そのまま離れてよい。
 */
export function MurmurPage() {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);

  return (
    <div className="murmur-shell min-h-screen">
      <div className="app-header">
        <AppHeader
          title="murmur"
          subtitle="ひとりごと"
          isSubPage
          iconSrc="/assets/takoyaki_anpan.png"
        />
        <MurmurActions onSave={() => downloadMurmurText(murmurs)} />
      </div>

      <div className="murmur-page">
        <MurmurStream murmurs={murmurs} />
        <MurmurAnpan nudge={murmurs.length} />
        <MurmurComposer onSend={(text) => setMurmurs((prev) => addMurmur(prev, text))} />
      </div>
    </div>
  );
}
