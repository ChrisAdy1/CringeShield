import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // or style.css if you're using that

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
