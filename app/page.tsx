/**
 * ============================================================================
 * 模块名称：高颜值战术看板 (前端用户界面 UI V3.0)
 * * 【绝对安全声明】：
 * 本段代码完全运行在你的浏览器客户端。它：
 * 1. 没有任何连接钱包的代码 (没有 Web3.js Provider 的注入)。
 * 2. 没有任何发起交易、请求签名、请求授权的功能。
 * 3. 不保存你的查询记录，网页一刷新，数据全部灰飞烟灭。
 * 它只是一个纯粹的、高度美化的数据展示“橱窗”。
 * * 【核心功能】：
 * 1. 响应式布局：完美适配从 iPhone 屏幕到 4K 显示器。
 * 2. 暗黑美学：Web3 极客风格的毛玻璃UI，提供沉浸式查阅体验。
 * 3. 业务呈现：将后端传来的数据拆分为总览大卡片和双列交易流，一目了然。
 * ============================================================================
 */
"use client";

import { useState } from "react";

// 定义后端返回的数据格式标准
type Transaction = {
  signature: string;
  timestamp: number;
  description: string;
  type: string;
};

type OnchainData = {
  total: number;
  swaps: Transaction[];
  stakes: Transaction[];
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnchainData | null>(null);

  // 点击查询按钮触发的核心操作
  const handleSearch = async () => {
    if (!address) {
      setError("请输入 Solana 钱包地址");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      // 安全呼叫咱们自己的后端接口，绝不直接去请求 Helius
      const response = await fetch(`/api/transactions?address=${address}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "获取数据失败");
      }

      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 工具函数：把时间戳转换成人类能看懂的时间格式
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8 mt-4 md:mt-12 animate-fade-in-up">
        
        {/* 头部标题区 */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
            Solana 24H 战术看板
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            实时追踪地址高频交互 · 自动过滤粉尘攻击
          </p>
        </div>
        
        {/* 搜索输入区 */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="输入 Solana 钱包地址..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-100 placeholder-slate-500 backdrop-blur-sm transition-all shadow-inner"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
          >
            {loading ? "链上检索中..." : "极速侦测"}
          </button>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* 数据展示区 */}
        {data && (
          <div className="space-y-6">
            
            {/* 1. 核心数据汇总 (响应式排版) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center">
                <p className="text-slate-400 text-sm font-medium mb-2">24H 总有效交互</p>
                <p className="text-5xl font-black text-white">{data.total}</p>
              </div>
              <div className="bg-cyan-900/20 border border-cyan-800/30 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center">
                <p className="text-cyan-400/80 text-sm font-medium mb-2">Swap 频次</p>
                <p className="text-5xl font-black text-cyan-400">{data.swaps.length}</p>
              </div>
              <div className="bg-purple-900/20 border border-purple-800/30 p-6 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center">
                <p className="text-purple-400/80 text-sm font-medium mb-2">Stake / Unstake</p>
                <p className="text-5xl font-black text-purple-400">{data.stakes.length}</p>
              </div>
            </div>

            {/* 2. 详细列表区 (响应式排版) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 左侧：Swap 列表 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col h-[600px] backdrop-blur-sm">
                <div className="bg-slate-800/80 border-b border-slate-700/50 px-5 py-4 flex justify-between items-center">
                  <span className="font-bold text-cyan-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    SWAP 交易流
                  </span>
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-3 py-1 rounded-full font-mono">
                    {data.swaps.length} TXs
                  </span>
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar">
                  {data.swaps.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">24小时内暂无 Swap 记录</div>
                  ) : (
                    data.swaps.map((tx) => (
                      <div key={tx.signature} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-mono text-cyan-200/70 bg-cyan-950/50 px-2 py-1 rounded">{formatTime(tx.timestamp)}</span>
                          <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 opacity-50 group-hover:opacity-100">
                            View on Solscan ↗
                          </a>
                        </div>
                        <p className="text-slate-300 text-sm break-words leading-relaxed">
                          {tx.description || "未知 Swap 交易明细"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 右侧：Stake 列表 */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col h-[600px] backdrop-blur-sm">
                <div className="bg-slate-800/80 border-b border-slate-700/50 px-5 py-4 flex justify-between items-center">
                  <span className="font-bold text-purple-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    STAKE 质押流
                  </span>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-3 py-1 rounded-full font-mono">
                    {data.stakes.length} TXs
                  </span>
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar">
                  {data.stakes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">24小时内暂无质押记录</div>
                  ) : (
                    data.stakes.map((tx) => (
                      <div key={tx.signature} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-xs font-mono text-purple-200/70 bg-purple-950/50 px-2 py-1 rounded">{formatTime(tx.timestamp)}</span>
                          <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1 opacity-50 group-hover:opacity-100">
                            View on Solscan ↗
                          </a>
                        </div>
                        <p className="text-slate-300 text-sm break-words leading-relaxed">
                          <span className={`font-bold mr-2 text-xs px-2 py-0.5 rounded ${tx.type === 'STAKE' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {tx.type}
                          </span>
                          {tx.description || "未知质押操作明细"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 美化滚动条和入场动画的 CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(51, 65, 85, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}} />
    </main>
  );
}