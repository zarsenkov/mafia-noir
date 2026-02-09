// --- ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ---
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Находим ту самую "дырку" в HTML-файле с id="root"
const root = ReactDOM.createRoot(document.getElementById('root'));

// Вставляем туда нашу игру
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
