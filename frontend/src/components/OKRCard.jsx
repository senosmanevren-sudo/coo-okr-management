import React, { useState, useEffect } from 'axios';
import axios from 'axios';
import ActionList from './ActionList';
import CreateActionForm from './CreateActionForm';
import AssignActionForm from './AssignActionForm';
import './OKRCard.css';

const API_BASE_URL = 'http://localhost:5000/api';

// İlerleme yüzdesini görsel olarak formatla
function ProgressBar({ progress }) {
  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

// Value display formatı (tip'e göre)
function KRValueDisplay({ krType, currentValue, targetValue, unit }) {
  const formatValue = (value, type) => {
    if (!value) return '0';
    const num = parseFloat(value);

    if (type === 'currency') {
      return num.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
      });
    }

    if (type === 'number') {
      return num.toLocaleString('tr-TR');
    }

    if (type === 'date') {
      return new Date(value).toLocaleDateString('tr-TR');
    }

    return num;
  };

  return (
    <div className="kr-value">
      <span className="kr-current">{formatValue(currentValue, krType)}</span>
      <span className="kr-unit">/</span>
      <span className="kr-target">{formatValue(targetValue, krType)}</span>
      {unit && <span className="kr-unit">{unit}</span>}
    </div>
  );
}

function OKRCard({ okr, allOKRs, onDelete, onRefresh }) {
  const [actions, setActions] = useState([]);
  const [childOKRs, setChildOKRs] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [selectedActionTitle, setSelectedActionTitle] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchActions();
    fetchChildOKRs();
  }, [okr.id]);

  const fetchActions = async () => {
    try {
      setLoadingActions(true);
      const response = await axios.get(`${API_BASE_URL}/actions/okr/${okr.id}`);
      setActions(response.data);
    } catch (err) {
      console.error('Error fetching actions:', err);
    } finally {
      setLoadingActions(false);
    }
  };

  const fetchChildOKRs = () => {
    const children = allOKRs.filter(o => o.parent_id === okr.id);
    setChildOKRs(children);
  };

  const handleAddAction = () => {
    setShowActionForm(true);
  };

  const handleAssignAction = (actionId, actionTitle) => {
    setSelectedActionId(actionId);
    setSelectedActionTitle(actionTitle);
    setShowAssignForm(true);
  };

  const handleEdit = () => {
    setEditFormData({
      title: okr.title,
      description: okr.description,
      objective: okr.objective,
      key_result: okr.key_result,
      kr_type: okr.kr_type,
      current_value: okr.current_value,
      target_value: okr.target_value,
      unit: okr.unit,
      status: okr.status,
    });
    setShowEditForm(true);
  };

  const handleSaveEdit = async () => {
    try {
      setEditLoading(true);
      await axios.put(`${API_BASE_URL}/okrs/${okr.id}`, editFormData);
      alert('✅ OKR başarıyla güncellendi!');
      onRefresh?.();
      setShowEditForm(false);
    } catch (err) {
      alert('❌ Güncelleme başarısız: ' + err.response?.data?.error || err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getLevelClass = (level) => `level-${level}`;
  const getStatusClass = (status) => `status-${status}`;

  return (
    <>
      <div className="okr-card">
        {/* Header */}
        <div className="okr-header">
          <div>
            <h3 className="okr-title">{okr.title}</h3>
            <span className={`okr-level ${getLevelClass(okr.level)}`}>
              Level {okr.level}
            </span>
          </div>
          <div className="okr-actions-menu">
            <button 
              className="btn-icon"
              onClick={handleEdit}
              title="Düzenle"
            >
              ✏️
            </button>
            <button 
              className="btn-icon btn-danger"
              onClick={() => onDelete?.(okr.id)}
              title="Sil"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Objective */}
        <div className="okr-objective">
          <strong>Objective:</strong> {okr.objective}
        </div>

        {/* Key Result */}
        <div className="okr-key-result">
          <strong>Key Result:</strong> {okr.key_result}
        </div>

        {/* Value Display */}
        <KRValueDisplay
          krType={okr.kr_type}
          currentValue={okr.current_value}
          targetValue={okr.target_value}
          unit={okr.unit}
        />

        {/* Progress Bar */}
        <ProgressBar progress={okr.progress} />

        {/* Status */}
        <span className={`okr-status ${getStatusClass(okr.status)}`}>
          {okr.status}
        </span>

        {/* Actions Section */}
        <div className="actions-section">
          <div className="section-header">
            <p className="section-title">📋 Actions</p>
            <button 
              className="btn-small"
              onClick={handleAddAction}
            >
              + Add Action
            </button>
          </div>

          {loadingActions ? (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>⏳ Aksiyonlar yükleniyor...</p>
          ) : actions.length > 0 ? (
            <ActionList 
              actions={actions} 
              onAssign={handleAssignAction}
              onRefresh={fetchActions}
            />
          ) : (
            <p style={{ color: '#999', fontSize: '0.9rem' }}>Henüz aksiyon yok</p>
          )}
        </div>

        {/* Child OKRs Count */}
        {childOKRs.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
            <small style={{ color: '#999' }}>
              ↳ {childOKRs.length} child OKR{childOKRs.length !== 1 ? 's' : ''}
            </small>
          </div>
        )}
      </div>

      {/* Create Action Form */}
      <CreateActionForm
        isOpen={showActionForm}
        onClose={() => setShowActionForm(false)}
        onSuccess={fetchActions}
        okrId={okr.id}
      />

      {/* Assign Action Form */}
      <AssignActionForm
        isOpen={showAssignForm}
        onClose={() => setShowAssignForm(false)}
        onSuccess={fetchActions}
        actionId={selectedActionId}
        actionTitle={selectedActionTitle}
      />

      {/* Edit OKR Form */}
      {showEditForm && editFormData && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ OKR'yi Düzenle</h2>
              <button className="modal-close" onClick={() => setShowEditForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Başlık</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Şu Anki Değer</label>
                <input
                  type="text"
                  value={editFormData.current_value}
                  onChange={(e) => setEditFormData({ ...editFormData, current_value: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Durum</label>
                <select 
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="active">🟢 Active</option>
                  <option value="completed">✅ Completed</option>
                  <option value="paused">⏸️ Paused</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowEditForm(false)}
                >
                  İptal
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                >
                  {editLoading ? '⏳ Kaydediliyor...' : '✅ Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OKRCard;
