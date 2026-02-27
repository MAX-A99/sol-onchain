/**
 * ============================================================================
 * 模块名称：专属数据抓取中转站 V3.0 (Seeker 纯净战术版)
 * * 【安全机制】：
 * 此文件上传至 GitHub 时，绝不会包含你的真实 API Key (被 .gitignore 保护)。
 * 任何人克隆此项目，都必须自行配置 .env.local 才能使用。
 * * 【数据清洗逻辑】：
 * 1. 严格截取东八区当天凌晨 00:00 至今的数据。
 * 2. 白名单：仅放行 SWAP 和 UNKNOWN。
 * 3. 智能重写：将 Seeker 的 UNKNOWN 交互直接重写为 'STAKE'，并附带
 * '质押SKR' 的专属描述，完美适配前端的左右分栏展示。
 * 4. 彻底抛弃 TRANSFER，完全免疫粉尘攻击。
 * ============================================================================
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: '请提供 Solana 钱包地址' }, { status: 400 });
  }

  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key 未配置，请开发者自行创建 .env.local 并填入密钥' }, { status: 500 });
  }

  try {
    const allTodayTxs: any[] = [];
    let lastSignature = null;
    let keepFetching = true;
    
    // 计算东八区 (UTC+8) 当天 00:00:00 的绝对时间戳（秒）
    const nowSec = Math.floor(Date.now() / 1000);
    const startOfDayUTC8 = nowSec - ((nowSec + 8 * 3600) % 86400);

    while (keepFetching) {
      let url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}`;
      if (lastSignature) url += `&before=${lastSignature}`;

      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`Helius 请求失败`);
      const txs = await response.json();

      if (txs.length === 0) break;

      for (const tx of txs) {
        // 确保是东八区今天的数据
        if (tx.timestamp >= startOfDayUTC8) {
          
          // 核心过滤逻辑
          if (tx.type === 'SWAP') {
             // SWAP 正常放行
             allTodayTxs.push(tx);
          } else if (tx.type === 'UNKNOWN') {
             // 将 UNKNOWN 强制伪装成 STAKE，并打上专属标签
             tx.type = 'STAKE'; 
             tx.description = '质押SKR (Seeker专属底层交互)';
             allTodayTxs.push(tx);
          } else if (tx.type === 'STAKE' || tx.type === 'UNSTAKE') {
             // 保留常规的质押操作，以防万一
             allTodayTxs.push(tx);
          }
          // 注意：TRANSFER 等其他类型在这里被悄无声息地丢弃了！
          
        } else {
          keepFetching = false;
          break; 
        }
      }
      if (keepFetching) lastSignature = txs[txs.length - 1].signature;
    }

    // 分类打包发给前端
    const swaps = allTodayTxs.filter(tx => tx.type === 'SWAP');
    // 因为前面我们把 UNKNOWN 改成了 STAKE，所以这里它会自动进入 stakes 列表
    const stakes = allTodayTxs.filter(tx => tx.type === 'STAKE' || tx.type === 'UNSTAKE');

    return NextResponse.json({ success: true, data: { total: swaps.length + stakes.length, swaps, stakes } });

  } catch (error) {
    console.error("抓取失败:", error);
    return NextResponse.json({ error: '获取链上数据失败' }, { status: 500 });
  }
}