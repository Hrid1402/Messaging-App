import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Error.css';

function Error() {
  return (
    <div className="error-container">
    <h1 className="error-title">404</h1>
    <p className="error-message">Page not found</p>
    <Link to="/" className="error-link">
      Back to Home
    </Link>
  </div>
  )
}

export default Error