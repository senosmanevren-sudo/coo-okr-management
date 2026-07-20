import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OKRCard from './OKRCard';
import CreateOKRForm from './CreateOKRForm';

const API_BASE_URL = 'http://localhost:5000/api';

function Dashboard() {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchOKRs();
  }, []);

  const fetchOKRs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/okrs`);
      setOkrs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching OKRs:', err);
      setError('Failed to fetch OKRs. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchOKRs();
  };

  const handleDeleteOKR = async (id) => {
    if (!window.confirm('Bu OKR\'ı silmek istediğinizden emin misiniz? Alt OKR\'ler de silinecek.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/okrs/${id}`);
      setOkrs(okrs.filter(o => o.id !== id));
      alert('✅ OKR başarıyla silindi!');
    } catch (err) {
      alert('❌ OKR silinirken hata oluştu: ' + err.response?.data?.error || err.message);
    }
  };

  if (loading) {
    return <div className="loading">📥 Loading OKRs...</div>;
  }

  if (error) {
    return <div className="error">⚠️ {error}</div>;
  }

  // OKR'leri level'e göre grupla
  const groupedOKRs = {
    1: okrs.filter(o => o.level === 1),
    2: okrs.filter(o => o.level === 2),
    3: okrs.filter(o => o.level === 3),
    4: okrs.filter(o => o.level === 4),
  };

  const levelNames = {
    1: '📍 Company Level (Şirket)',
    2: '🏢 Department Level (Departman)',
    3: '👥 Team Level (Takım)',
    4: '👤 Individual Level (Bireysel)',
  };

  return (
    <div className="dashboard">
      <CreateOKRForm 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <div className="dashboard-header">
        <h2>🎯 OKR Hierarchy</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + New OKR
        </button>
      </div>

      {/* Her level için OKR'leri göster */}
      {[1, 2, 3, 4].map(level => (
        groupedOKRs[level].length > 0 && (
          <div key={level} className="level-section">
            <h3>{levelNames[level]}</h3>
            <div className="okr-grid">
              {groupedOKRs[level].map(okr => (
                <OKRCard 
                  key={okr.id} 
                  okr={okr} 
                  allOKRs={okrs}
                  onDelete={handleDeleteOKR}
                  onRefresh={fetchOKRs}
                />
              ))}
            </div>
          </div>
        )
      ))}

      {okrs.length === 0 && (
        <div className="loading">
          📭 No OKRs yet. Create your first OKR to get started!
        </div>
      )}
    </div>
  );
}

export default Dashboard;
