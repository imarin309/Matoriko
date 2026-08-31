import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/header';
import { NoteComposer } from '../components/shelf/NoteComposer';
import { ShelfActions } from '../components/shelf/ShelfActions';
import { ShelfZone } from '../components/shelf/ShelfZone';
import { StickyNote } from '../components/shelf/StickyNote';
import { useNoteDrag } from '../components/shelf/useNoteDrag';
import { downloadShelfText } from '../components/shelf/downloadShelfText';
import {
  SHELF_ADD_LABEL,
  SHELF_BOXES,
  SHELF_CLOSE_LABEL,
  SHELF_DROP_LABEL,
  SHELF_HINT,
  SHELF_LEAD,
  SHELF_RETURN_LABEL,
  UNSORTED,
  addNote,
  moveNote,
  notesInZone,
  type ShelfNote,
  type ZoneId,
} from '../components/shelf/boxes';

/**
 * しんどいことを付箋に書いて、3つの箱に仕分けるだけのページ。
 * 考えさせない・数えない・「全部片付いた」を出さないのが前提。
 * 置いたものはページを離れると消えるので、残したいときだけ save で書き出す。
 */
export function ShelfPage() {
  const [notes, setNotes] = useState<ShelfNote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const place = useCallback((id: string, zone: ZoneId) => {
    setNotes((prev) => moveNote(prev, id, zone));
    setSelectedId(null);
  }, []);

  const { drag, registerZone, handlers, consumeDrag } = useNoteDrag(place);

  const selected = notes.find((note) => note.id === selectedId) ?? null;

  const tapNote = (id: string) => {
    // 直前がドラッグだった場合の click は、選択の切り替えとして扱わない
    if (consumeDrag()) return;
    setSelectedId((current) => (current === id ? null : id));
  };

  const dropTo = (zone: ZoneId) => {
    if (selected) place(selected.id, zone);
  };

  const renderNotes = (zone: ZoneId) =>
    notesInZone(notes, zone).map((note) => (
      <StickyNote
        key={note.id}
        note={note}
        selected={note.id === selectedId}
        dragging={drag?.id === note.id}
        dx={drag?.dx ?? 0}
        dy={drag?.dy ?? 0}
        onTap={() => tapNote(note.id)}
        handlers={handlers(note.id)}
      />
    ));

  /** 今いる場所には置き先を出さない（そこへ「置く」は意味がないため） */
  const receiving = (zone: ZoneId) => selected !== null && selected.zone !== zone;

  return (
    <div className="shelf-shell min-h-screen">
      <div className="app-header">
        <AppHeader
          title="shelf"
          subtitle="しんどさの棚おろし"
          isSubPage
          iconSrc="/assets/onsen_anpan.png"
        />
        <ShelfActions onSave={() => downloadShelfText(notes)} />
      </div>

      <div className="shelf-page">
        <div className="shelf-intro">
          <img src="/assets/onsen_anpan.png" alt="" className="shelf-intro-icon" />
          <p className="shelf-lead">{SHELF_LEAD}</p>
        </div>

        <NoteComposer onAdd={(text) => setNotes((prev) => addNote(prev, text))} />

        <ShelfZone
          variant="tray"
          active={drag?.over === UNSORTED}
          receiving={receiving(UNSORTED)}
          dropLabel={SHELF_RETURN_LABEL}
          dropAriaLabel={SHELF_RETURN_LABEL}
          onDrop={() => dropTo(UNSORTED)}
          zoneRef={registerZone(UNSORTED)}
        >
          {renderNotes(UNSORTED)}
        </ShelfZone>

        {notes.length > 0 && <p className="shelf-hint">{SHELF_HINT}</p>}

        <div className="shelf-boxes">
          {SHELF_BOXES.map((box) => (
            <ShelfZone
              key={box.id}
              variant="box"
              label={box.label}
              active={drag?.over === box.id}
              receiving={receiving(box.id)}
              dropLabel={SHELF_DROP_LABEL}
              dropAriaLabel={`「${box.label}」に${SHELF_ADD_LABEL}`}
              onDrop={() => dropTo(box.id)}
              zoneRef={registerZone(box.id)}
            >
              {renderNotes(box.id)}
            </ShelfZone>
          ))}
        </div>

        <div className="shelf-actions">
          <Link to="/" className="shelf-quiet">
            {SHELF_CLOSE_LABEL}
          </Link>
        </div>
      </div>
    </div>
  );
}
