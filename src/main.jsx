import React from 'react'
import ReactDOM from 'react-dom/client'
import Modal from 'react-modal'; // <-- MAKE SURE THIS IS HERE
import App from './App.jsx'
import './index.css'

Modal.setAppElement('#root'); // <-- AND MAKE SURE THIS IS HERE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)