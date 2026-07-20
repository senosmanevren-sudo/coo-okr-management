import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function ActionList({ actions, onAssign, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteAction = async (actionId) => {
    if (!window.confirm('Bu aksiyonu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setDeletingId(actionId);
      await axios.delete(`${API_BASE_URL}/actions/${actionId}`);
      onRefresh?.();
    } catch (err) {
      alert('❌ Aksiyon silinirken hata oluştu: ' + err.response?.data?.error || err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStatus = async (actionId, currentStatus) => {
    const statuses = ['todo', 'in_progress', 'done'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await axios.put(`${API_BASE_URL}/actions/${actionId}`, {
        status: nextStatus,
      });
      onRefresh?.();
    } catch (err) {
      alert('❌ Durum güncellenirken hata oluştu');
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'todo':
        return { icon: '○', label: 'To Do' };
      case 'in_progress':
        return { icon: '◐', label: 'In Progress' };
      case 'done':
        return { icon: '✓', label: 'Done' };
      default:
        return { icon: '○', label: 'To Do' };
    }
  };

  return (
    <div className="actions-list">
      {actions.map(action => {
        const statusDisplay = getStatusDisplay(action.status);
        return (
          <div key={action.id} className="action-item">
            <div className="action-item-left">
              <button
                className={`action-status ${action.status}`}
                onClick={() => handleUpdateStatus(action.id, action.status)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
                title="Durumu değiştir"
              >
                {statusDisplay.icon}
              </button>
              <span className="action-title">{action.title}</span>
              <span className="action-priority">
                {action.priority === 'high' && '🔴'}
                {action.priority === 'medium' && '🟡'}
                {action.priority === 'low' && '🟢'}
              </span>
            </div>
            <div className="action-buttons">
              <button
                className="action-button"
                onClick={() => onAssign?.(action.id, action.title)}
                title="Ata"
              >
                👤
              </button>
              <button
                className="action-button"
                onClick={() => handleDeleteAction(action.id)}
                disabled={deletingId === action.id}
                title="Sil"
              >
                {deletingId === action.id ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActionList;
