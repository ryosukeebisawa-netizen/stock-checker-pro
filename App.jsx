import React, { useState } from 'react';

const App = () => {
  const [stockData, setStockData] = useState({ allTime: [], yearToDate: [] });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchHighStocks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data.json');
      const data = await response.json();
      console.log("読み込みデータ:", data);
      
      setStockData({
        allTime: data.allTime || [],
        yearToDate: data.yearToDate || []
      });
      setLastUpdated(data.lastUpdated || '更新なし');
    } catch (error) {
      console.error("エラー:", error);
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>新高値チェッカーPRO</h1>
      <button onClick={fetchHighStocks} disabled={loading}>
        {loading ? 'スキャン中...' : '市場をスキャン'}
      </button>
      <p>最終更新: {lastUpdated}</p>
      
      <h3>上場来高値銘柄</h3>
      {stockData.allTime.length > 0 ? (
        stockData.allTime.map((s, i) => (
          <div key={i} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            {s.name} ({s.code}) - {s.price}
          </div>
        ))
      ) : (
        <p>データがありません。スキャンしてください。</p>
      )}
    </div>
  );
};

export default App;
