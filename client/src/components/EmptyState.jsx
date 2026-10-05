import React from 'react';
import '../css/emptystate.css';

const EmptyState = ({ titulo, mensaje, accion }) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <h3 className="empty-state-title">{titulo || "No hay resultados"}</h3>
      <p className="empty-state-message">{mensaje || "No encontramos lo que estás buscando."}</p>
      {accion && (
        <button className="empty-state-btn" onClick={accion.onClick}>
          {accion.texto}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
