import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fff1f2',
          borderRadius: '1rem',
          margin: '2rem',
          border: '2px solid #fda4af',
          color: '#9f1239'
        }}>
          <h2>Oops! Something went wrong.</h2>
          <p>The dashboard encountered an unexpected error. Don't worry, your data is safe.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e11d48',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Dashboard
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ textAlign: 'left', marginTop: '1.5rem', overflowX: 'auto', fontSize: '0.8rem' }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
