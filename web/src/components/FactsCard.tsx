import { useState } from 'react';
import { Facts } from '../types';

interface Props {
  facts: Facts;
  onFactsUpdated: (facts: Facts) => void;
}

export default function FactsCard({ facts, onFactsUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [editedFacts, setEditedFacts] = useState<Facts>(facts);

  const handleEdit = () => {
    setEditedFacts(facts);
    setEditing(true);
  };

  const handleSave = () => {
    onFactsUpdated(editedFacts);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditedFacts(facts);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="card">
        <h2>Extracted Facts</h2>
        <div className="facts-display">
          <pre>{JSON.stringify(facts, null, 2)}</pre>
        </div>
        <div className="button-group">
          <button onClick={handleEdit}>Edit Facts</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Edit Facts</h2>
      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          value={editedFacts.category}
          onChange={(e) => setEditedFacts({ ...editedFacts, category: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Brand</label>
        <input
          type="text"
          value={editedFacts.brand}
          onChange={(e) => setEditedFacts({ ...editedFacts, brand: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Model</label>
        <input
          type="text"
          value={editedFacts.model}
          onChange={(e) => setEditedFacts({ ...editedFacts, model: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Year or Edition</label>
        <input
          type="text"
          value={editedFacts.year_or_edition}
          onChange={(e) => setEditedFacts({ ...editedFacts, year_or_edition: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Condition</label>
        <select
          value={editedFacts.condition}
          onChange={(e) => setEditedFacts({ ...editedFacts, condition: e.target.value as Facts['condition'] })}
        >
          <option value="new">New</option>
          <option value="ln">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div className="form-group">
        <label>Attributes (comma-separated)</label>
        <input
          type="text"
          value={editedFacts.attributes.join(', ')}
          onChange={(e) => setEditedFacts({
            ...editedFacts,
            attributes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          value={editedFacts.notes}
          onChange={(e) => setEditedFacts({ ...editedFacts, notes: e.target.value })}
        />
      </div>

      <div className="button-group">
        <button onClick={handleSave} className="success">Save & Use These Facts</button>
        <button onClick={handleCancel} className="secondary">Cancel</button>
      </div>
    </div>
  );
}
