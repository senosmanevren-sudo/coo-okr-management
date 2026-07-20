import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';

const API_BASE_URL = 'http://localhost:5000/api';

function CreateActionForm({ isOpen, onClose, onSuccess, okrId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.title) {
      setError('Lütfen aksiyon başlığını girin');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/actions`, {
        ...formData,
        okr_id: okrId,
        status: 'todo',
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
        });
        onClose?.();
      }, 1000);
    } catch (err) {
      setError('Aksiyon oluştururken hata oluştu: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="📋 Yeni Aksiyon Ekle" onClose={onClose}>
      {error && <div className="error-message">❌ {error}</div>}
      {success && <div className="success-message">✅ Aksiyon başarıyla eklendi!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Aksiyon Başlığı *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Örn: Müşteri anketi gönder"
            required
          />
        </div>

        <div className="form-group">
          <label>Açıklama</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Aksiyon hakkında detaylar..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Öncelik</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">🟢 Düşük</option>
              <option value="medium">🟡 Orta</option>
              <option value="high">🔴 Yüksek</option>
            </select>
          </div>

          <div className="form-group">
            <label>Son Tarih</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            İptal
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Ekleniyor...' : '✅ Aksiyon Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateActionForm;
