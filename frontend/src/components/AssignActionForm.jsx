import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';

const API_BASE_URL = 'http://localhost:5000/api';

function AssignActionForm({ isOpen, onClose, onSuccess, actionId, actionTitle }) {
  const [formData, setFormData] = useState({
    assigned_to: '',
    notes: '',
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Kullanıcıları yüklemede hata:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

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

    if (!formData.assigned_to) {
      setError('Lütfen bir kişi seçin');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/assignments`, {
        action_id: actionId,
        assigned_to: parseInt(formData.assigned_to),
        assigned_by: 1, // Şu anki kullanıcı (ilerde login ile dinamik olacak)
        notes: formData.notes,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        setFormData({
          assigned_to: '',
          notes: '',
        });
        onClose?.();
      }, 1000);
    } catch (err) {
      setError('Atama yapılırken hata oluştu: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title={`👤 Atama Yap: ${actionTitle}`} onClose={onClose}>
      {error && <div className="error-message">❌ {error}</div>}
      {success && <div className="success-message">✅ Aksiyon başarıyla atandı!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kişi Seç *</label>
          {loadingUsers ? (
            <p style={{ color: '#999' }}>⏳ Kullanıcılar yükleniyor...</p>
          ) : (
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              required
            >
              <option value="">-- Bir kişi seçin --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Notlar</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Bu atama hakkında notlar..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            İptal
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Atanıyor...' : '✅ Atamayı Yap'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignActionForm;
