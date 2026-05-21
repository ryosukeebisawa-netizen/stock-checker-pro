import React, { useState, useEffect } from 'react';

const App = () => {
  const [stockData, setStockData] = useState({ allTime: [], yearToDate: [] });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [hasFetched, setHasFetched] = useState(false);

  const fetchHighStocks = async () => {
    setLoading(true);
    setHasFetched(false);
    try {
      // データの読み込み
      const response = await fetch('/data.json');
      const data = await response.json();
      
      // ここで中身をデバッグ用にコンソールへ表示
      console.log("読み込んだデータ:", data);
      
      setStockData({
        allTime: data.allTime || [],
        yearToDate: data.yearToDate || []
      });
      setLastUpdated(data.lastUpdated || '更新日時不明');
      setHasFetched(true);
    } catch (error) {
      console.error("データ取得エラー:", error);
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
      
      {lastUpdated && <p>最終更新: {lastUpdated}</p>}

      {hasFetched && stockData.allTime.length === 0 && (
        <p>表示できる銘柄がありません（データは読み込めています）</p>
      )}

      {stockData.allTime.map((stock, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
          <strong>{stock.name}</strong> ({stock.code}) - {stock.price}
        </div>
      ))}
    </div>
  );
};

export default App;
