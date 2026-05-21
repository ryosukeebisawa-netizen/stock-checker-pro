import React, { useState, useMemo } from 'react';

// --- モックデータ（実戦的な指標を追加） ---
const mockAllTime = [
  { code: '6920', name: 'レーザーテック', price: '38,500', diff: '+1,200', diffPct: '+3.2', yield: '0.5%', volMult: 4.5, volText: '+350%', eps: '+65%', sales: '+40%', sector: '電気機器', theme: '半導体' },
  { code: '9984', name: 'ソフトバンクG', price: '9,200', diff: '+150', diffPct: '+1.6', yield: '0.5%', volMult: 1.8, volText: '+80%', eps: '黒転', sales: '+12%', sector: '情報・通信', theme: 'AI' },
  { code: '6146', name: 'ディスコ', price: '52,300', diff: '+2,100', diffPct: '+4.1', yield: '0.8%', volMult: 3.2, volText: '+220%', eps: '+42%', sales: '+25%', sector: '機械', theme: '半導体製造装置' },
  { code: '8031', name: '三井物産', price: '7,150', diff: '+85', diffPct: '+1.2', yield: '2.9%', volMult: 1.2, volText: '+20%', eps: '+8%', sales: '+5%', sector: '卸売業', theme: '高配当/バリュー' }
];

const mockYTD = [
  { code: '7267', name: '本田技研工業', price: '1,850', diff: '+25', diffPct: '+1.3', yield: '4.5%', volMult: 1.5, volText: '+50%', eps: '+15%', sales: '+10%', sector: '輸送用機器', theme: '円安メリット' },
  { code: '4661', name: 'オリエンタルL', price: '5,420', diff: '+120', diffPct: '+2.2', yield: '0.8%', volMult: 2.1, volText: '+110%', eps: '+28%', sales: '+18%', sector: 'サービス業', theme: 'インバウンド' },
  { code: '8306', name: '三菱UFJ FG', price: '1,650', diff: '+15', diffPct: '+0.9', yield: '3.8%', volMult: 2.5, volText: '+150%', eps: '+22%', sales: '+15%', sector: '銀行業', theme: '金利上昇' },
  { code: '9432', name: '日本電信電話', price: '185.5', diff: '+2.1', diffPct: '+1.1', yield: '2.8%', volMult: 0.9, volText: '-10%', eps: '+3%', sales: '+1%', sector: '情報・通信', theme: 'ディフェンシブ' },
  { code: '6861', name: 'キーエンス', price: '72,000', diff: '+1,500', diffPct: '+2.1', yield: '0.4%', volMult: 3.8, volText: '+280%', eps: '+18%', sales: '+12%', sector: '電気機器', theme: 'FA/自動化' }
];

export default function App() {
  // === パスワード認証機能 ===
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const checkPassword = () => {
    // ※ここでパスワードを設定しています。必要に応じて '1234' を好きな数字に変更できます
    if (password === '1234') { 
      setAuthenticated(true);
    } else {
      alert('パスワードが違います');
    }
  };

  // 認証前のログイン画面
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h2 className="text-2xl font-extrabold mb-2 text-slate-800 flex justify-center items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            新高値チェッカー
          </h2>
          <p className="text-slate-500 text-sm mb-6">専用ツールにログイン</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            className="border border-slate-300 p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
            placeholder="パスワード"
          />
          <button
            onClick={checkPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  // === 以下、チェッカー本体の機能 ===
  const [activeTab, setActiveTab] = useState('allTime'); 
  const [stockData, setStockData] = useState({ allTime: [], yearToDate: [] });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  
  const [sortType, setSortType] = useState('default'); 
  const [watchlist, setWatchlist] = useState([]); 
  const [excluded, setExcluded] = useState([]); 
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExcludedOpen, setIsExcludedOpen] = useState(false);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${y}年${m}月${d}日 ${h}時${min}分`;
  };

  const fetchHighStocks = async () => {
    setLoading(true);
    setHasFetched(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const getRandomData = (sourceArray) => {
      if (Math.random() < 0.2) return [];
      const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
      const count = Math.floor(Math.random() * sourceArray.length) + 1;
      return shuffled.slice(0, count);
    };

    setStockData({
      allTime: getRandomData(mockAllTime),
      yearToDate: getRandomData(mockYTD)
    });
    setLastUpdated(formatDate(new Date()));
    setHasFetched(true);
    setLoading(false);
  };

  const toggleWatchlist = (code) => {
    setWatchlist(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const excludeStock = (code) => {
    setExcluded(prev => [...prev, code]);
  };

  const restoreStock = (code) => {
    setExcluded(prev => prev.filter(c => c !== code));
  };

  const getExcludedStocksDetails = () => {
    const allUniqueStocks = Array.from(new Map([...mockAllTime, ...mockYTD].map(s => [s.code, s])).values());
    return allUniqueStocks.filter(s => excluded.includes(s.code));
  };

  const displayStocks = useMemo(() => {
    let current = stockData[activeTab] ? [...stockData[activeTab]] : [];
    current = current.filter(stock => !excluded.includes(stock.code));
    
    if (sortType === 'volume') {
      current.sort((a, b) => b.volMult - a.volMult);
    } else if (sortType === 'priceDiff') {
      current.sort((a, b) => parseFloat(b.diffPct) - parseFloat(a.diffPct));
    } else if (sortType === 'eps') {
      const parseEps = (epsStr) => {
        if (epsStr === '黒転') return 999;
        return parseFloat(epsStr.replace(/[^0-9.-]/g, '')) || 0;
      };
      current.sort((a, b) => parseEps(b.eps) - parseEps(a.eps));
    } else if (sortType === 'yield') {
      const parseYield = (yStr) => parseFloat(yStr.replace(/[^0-9.-]/g, '')) || 0;
      current.sort((a, b) => parseYield(b.yield) - parseYield(a.yield));
    }
    return current;
  }, [stockData, activeTab, excluded, sortType]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center font-sans text-slate-800 relative">
      
      <button 
        onClick={() => setIsHelpOpen(true)}
        className="absolute top-4 right-4 md:top-8 md:right-8 bg-white text-slate-600 hover:text-blue-600 shadow-sm hover:shadow-md border border-slate-200 rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1 transition-all z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        用語ヘルプ
      </button>

      <div className="text-center mb-6 mt-8 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-2 flex items-center justify-center gap-2">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          新高値チェッカー PRO
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium">〜CAN SLIM準拠 銘柄スクリーニング〜</p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            <div className="flex bg-slate-200/70 p-1 rounded-lg w-full md:w-auto relative">
              <button onClick={() => setActiveTab('allTime')} className={`flex-1 md:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'allTime' ? 'text-blue-700 shadow bg-white' : 'text-slate-500 hover:text-slate-700'}`}>上場来高値</button>
              <button onClick={() => setActiveTab('yearToDate')} className={`flex-1 md:px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'yearToDate' ? 'text-blue-700 shadow bg-white' : 'text-slate-500 hover:text-slate-700'}`}>年初来高値</button>
            </div>
            
            <button 
              onClick={fetchHighStocks}
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? '検索中...' : '市場をスキャン'}
            </button>
          </div>

          {hasFetched && (
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500 font-bold text-xs mr-1">並び替え:</span>
                <button onClick={() => setSortType('default')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${sortType === 'default' ? 'bg-slate-800 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>標準</button>
                <button onClick={() => setSortType('volume')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${sortType === 'volume' ? 'bg-red-500 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>出来高順</button>
                <button onClick={() => setSortType('priceDiff')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${sortType === 'priceDiff' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>値上がり率</button>
                <button onClick={() => setSortType('eps')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center gap-1 ${sortType === 'eps' ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                   業績(EPS)
                </button>
                <button onClick={() => setSortType('yield')} className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${sortType === 'yield' ? 'bg-purple-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>配当利回り</button>
              </div>
              
              <div className="flex justify-between items-center">
                {excluded.length > 0 ? (
                  <button onClick={() => setIsExcludedOpen(true)} className="px-3 py-1 rounded-full font-bold text-xs bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    除外中 ({excluded.length})
                  </button>
                ) : <div></div>}
                
                {lastUpdated && (
                  <div className="text-[10px] md:text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border">
                    {lastUpdated}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-100 min-h-[400px]">
          {loading && (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-white rounded-xl shadow-sm border-l-4 border-slate-200"></div>
              ))}
            </div>
          )}

          {!loading && hasFetched && displayStocks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
               <span className="text-4xl mb-3">📭</span>
               <p className="text-slate-500 font-bold text-lg">表示できる銘柄がありません</p>
               <p className="text-slate-400 text-sm mt-1">ダマシを回避するため見送るか、除外リストを確認してください。</p>
            </div>
          )}

          {!loading && hasFetched && displayStocks.length > 0 && (
            <div className="flex flex-col gap-4">
              {displayStocks.map((stock, index) => {
                const isWatchlisted = watchlist.includes(stock.code);
                const isHighVolume = stock.volMult >= 2.0;

                return (
                  <div key={`${stock.code}-${index}`} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${isHighVolume ? 'border-red-500' : 'border-blue-400'} animate-[fadeIn_0.4s_ease-out_forwards]`} style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-500 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border">{stock.code}</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{stock.sector}</span>
                          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{stock.theme}</span>
                        </div>
                        <div className="text-lg font-extrabold text-slate-800">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-800">¥{stock.price}</div>
                        <div className="text-sm font-bold text-red-500">+{stock.diff} ({stock.diffPct}%)</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 my-3 py-3 border-y border-slate-100 bg-slate-50/50 rounded-lg">
                      <div className="text-center border-r border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold mb-1">出来高変化</div>
                        <div className={`text-sm font-black ${isHighVolume ? 'text-white bg-red-500 rounded px-1 inline-block' : 'text-slate-700'}`}>{stock.volText}</div>
                      </div>
                      <div className="text-center border-r border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold mb-1">直近EPS成長</div>
                        <div className="text-sm font-bold text-emerald-600">{stock.eps}</div>
                      </div>
                      <div className="text-center border-r border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold mb-1">売上成長</div>
                        <div className="text-sm font-bold text-emerald-600">{stock.sales}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-slate-400 font-bold mb-1">配当利回り</div>
                        <div className="text-sm font-bold text-purple-600">{stock.yield}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <a href={`https://finance.yahoo.co.jp/quote/${stock.code}.T`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                        チャート確認
                      </a>
                      
                      <div className="flex gap-2">
                        <button onClick={() => toggleWatchlist(stock.code)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${isWatchlisted ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                          {isWatchlisted ? '★ 監視中' : '☆ 監視追加'}
                        </button>
                        <button onClick={() => excludeStock(stock.code)} className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-all">
                          × 除外
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isHelpOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                投資用語ヘルプ
              </h2>
              <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm text-slate-700">
              <div>
                <h3 className="font-bold text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded mb-1">出来高変化</h3>
                <p>その日に取引された株数の増加率。本物の新高値ブレイクは、大口投資家の買いにより過去の平均の<strong className="text-red-500">2倍以上(+100%〜)</strong>の出来高を伴います。当ツールでは2倍以上を赤色で警告表示します。</p>
              </div>
              <hr className="border-slate-100" />
              <div>
                <h3 className="font-bold text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded mb-1">直近EPS成長</h3>
                <p>EPS(1株当たり利益)の成長率。直近の四半期決算で<strong className="text-emerald-600">前年同期比+20%以上</strong>ある銘柄は、その後の大きな株価上昇の原動力となります。「黒転」は赤字から黒字への転換を意味し、強い買い材料になります。</p>
              </div>
              <hr className="border-slate-100" />
              <div>
                <h3 className="font-bold text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded mb-1">CAN SLIM (キャンスリム)</h3>
                <p>米国の著名投資家W・オニールが提唱した大化け株の法則。本ツールはこの法則に基づき、業績(C,A)と需給(S,L)を満たす銘柄を探す補助をします。</p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setIsHelpOpen(false)} className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-700">閉じる</button>
            </div>
          </div>
        </div>
      )}

      {isExcludedOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                除外した銘柄 ({excluded.length})
              </h2>
              <button onClick={() => setIsExcludedOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {getExcludedStocksDetails().length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">除外された銘柄はありません。</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {getExcludedStocksDetails().map(stock => (
                    <div key={`ex-${stock.code}`} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <div>
                        <span className="text-xs text-slate-500 font-bold">{stock.code}</span>
                        <div className="font-bold text-slate-800">{stock.name}</div>
                      </div>
                      <button 
                        onClick={() => restoreStock(stock.code)}
                        className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
                      >
                        ↩ 復元する
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button onClick={() => setIsExcludedOpen(false)} className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-700">完了</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
