import { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder: string;
  fieldType: 'title' | 'text';
  disabled?: boolean;
}

export const EditableField = ({
  value,
  onSave,
  placeholder,
  fieldType,
  disabled = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || fieldType === 'title')) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // disabledの時はクリックを親に伝播させる（ノード全体の拡大を優先）
    if (disabled) {
      return;
    }

    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
      setEditValue(value);
    }
  };

  if (isEditing) {
    if (fieldType === 'title') {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="node-title-input"
          placeholder={placeholder}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      );
    } else {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="node-text-input"
          placeholder={placeholder}
          rows={3}
          style={{ resize: 'none' }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
  }

  return (
    <div
      onClick={handleClick}
      className={fieldType === 'title' ? 'node-title-display' : 'node-text-display'}
    >
      {value || placeholder}
    </div>
  );
};
