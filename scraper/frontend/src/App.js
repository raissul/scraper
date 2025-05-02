import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');

  const fetchInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:8000/fetch-info', { url });
      setInfo(response.data);
      setSelectedFormat(response.data.formats[0]?.format_id || '');
    } catch (err) {
      setError('Failed to fetch media info.');
      setInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!selectedFormat) return;
    window.location.href = `http://localhost:8000/download?url=${encodeURIComponent(url)}&format_id=${selectedFormat}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Universal Media Downloader</h1>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mb-4"
          placeholder="Enter media URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={fetchInfo}
          disabled={loading || !url}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Loading...' : 'Fetch Info'}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {info && (
          <div className="mt-6">
            <img src={info.thumbnail} alt="thumbnail" className="w-full rounded mb-2" />
            <h2 className="text-lg font-semibold mb-2">{info.title}</h2>
            <select
              className="w-full border border-gray-300 p-2 rounded mb-4"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {info.formats.map((f) => (
                <option key={f.format_id} value={f.format_id}>
                  {f.format_note || f.format} - {f.ext} - {Math.round((f.filesize || 0) / 1024 / 1024)} MB
                </option>
              ))}
            </select>
            <button
              onClick={download}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
