import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#13131F',
            color: '#F0F0FF',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#7C3AED', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EC4899', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
