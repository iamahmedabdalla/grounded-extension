import React from 'react';
import ReactDOM from 'react-dom';
import EmailScanner from './App'; // Your main React component

const InjectedApp = () => {
  return <EmailScanner />;
};

// Mount the React app to the container
const container = document.getElementById('grounded-email-scanner');
ReactDOM.render(<InjectedApp />, container);