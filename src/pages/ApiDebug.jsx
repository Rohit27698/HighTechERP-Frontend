import React, {useState} from 'react';
import api from '../services/api';

export default function ApiDebug(){
  const [result, setResult] = useState(null);

  const run = async () => {
    setResult('Checking business-settings...');
    const s = await api.settings.get();
    setResult(prev => prev + '\n' + JSON.stringify(s, null, 2));

    const p = await api.products.list();
    setResult(prev => prev + '\n\nProducts:\n' + JSON.stringify(p, null, 2));
  }

  return (
    <div className="container">
      <h2>API Debug</h2>
      <p>Use this page to check connectivity with the backend API.</p>
      <button onClick={run}>Run API checks</button>
      <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{result ? (typeof result === 'string' ? result : JSON.stringify(result, null, 2)) : 'Not run yet'}</pre>
    </div>
  )
}
