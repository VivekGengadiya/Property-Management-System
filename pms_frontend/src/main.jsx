import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorProvider }from '../src/context/ErrorContext.jsx'
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorProvider>
    <App />
    </ErrorProvider>
  </React.StrictMode>
)
