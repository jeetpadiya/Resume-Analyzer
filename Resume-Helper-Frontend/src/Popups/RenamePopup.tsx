import { useEffect, useState } from "react";

interface RenamePopupProps {
  initialName: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => Promise<void> | void;
}

const RenamePopup = ({ initialName, isSubmitting = false, onClose, onSubmit }: RenamePopupProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Please enter a resume name.");
      return;
    }

    await onSubmit(trimmedName);
  };

  return (
    <div
      className="history-modal-backdrop"
      onClick={onClose}
    >
      <form
        className="history-modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="history-modal-glow history-modal-glow-1" />
        <div className="history-modal-glow history-modal-glow-2" />

        <p className="history-modal-eyebrow">Edit Resume</p>
        <p className="history-modal-title">Rename Resume</p>
        <p className="history-modal-copy">Choose a polished name for this saved resume entry.</p>

        <input
          autoFocus
          className="history-modal-input"
          disabled={isSubmitting}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter new name"
          type="text"
          value={name}
        />

        <div className="history-modal-actions">
          <button
            className="history-modal-button history-modal-button-secondary"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="history-modal-button history-modal-button-primary"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RenamePopup;
