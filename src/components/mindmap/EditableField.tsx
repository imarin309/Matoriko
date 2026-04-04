import { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder: string;
  fieldType: 'title' | 'text';
  disabled?: boolean;
  onRequestEdit?: () => void;
  isEdit?: boolean;
}

export const EditableField = ({
  value,
  onSave,
  placeholder,
  fieldType,
  disabled = false,
  onRequestEdit,
  isEdit = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLastEdit, setIsLastEdit] = useState(false);

  // editTriggerが変化したら編集モードに入る（レンダリング中の状態更新）
  if (isEdit !== isLastEdit && !disabled && !isEditing) {
    setIsLastEdit(isEdit);
    setIsEditing(true);
    setEditValue(value);
  }

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
    e.stopPropagation();

    // disabledの時は親に編集リクエストを通知
    if (disabled) {
      if (onRequestEdit) {
        onRequestEdit();
      }
      return;
    }

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
