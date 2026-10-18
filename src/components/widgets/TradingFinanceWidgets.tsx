import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Bot, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

import type { TradeEvent } from '../../lib/types.ts';

interface TradingFinanceWidgetsProps {
  externalTrades?: TradeEvent[];
}

export const TradingFinanceWidgets: React.FC<TradingFinanceWidgetsProps> = ({ externalTrades }) => {
  // Token Wallet Data
  const [tokenData, setTokenData] = useState([
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', cls: 'btc', color: 'text-amber-400 bg-amber-400/20', amount: '1.2450', value: '$129,420', change: '+2.4%', pos: true },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', cls: 'eth', color: 'text-indigo-400 bg-indigo-400/20', amount: '18.7', value: '$59,240', change: '+1.8%', pos: true },
    { symbol: 'SOL', name: 'Solana', icon: '◎', cls: 'sol', color: 'text-purple-400 bg-purple-400/20', amount: '342', value: '$64,150', change: '-0.6%', pos: false },
    { symbol: 'MON', name: 'Monad', icon: 'M', cls: 'mono', color: 'text-cyan-400 bg-cyan-400/20', amount: '12,400', value: '$8,200', change: '+5.2%', pos: true },
    { symbol: 'USDC', name: 'USD Coin', icon: '$', cls: 'usdc', color: 'text-emerald-400 bg-emerald-400/20', amount: '4,500', value: '$4,500', change: '0.0%', pos: true },
  ]);

  // Grok Autotrader Bots
  const [grokBots, setGrokBots] = useState([
    {
      id: 'bot_1',
      name: 'Grok-Momentum',
      strategy: 'RSI + MACD crossover on 4H BTC/ETH',
      status: 'running',
      pnl: '+$2,340',
      pos: true,
      trades: 14,
      winRate: '71%'
    },
    {
      id: 'bot_2',
      name: 'Grok-MeanRevert',
      strategy: 'Bollinger Band bounce on SOL/USDC 1H',
      status: 'running',
      pnl: '+$892',
      pos: true,
      trades: 8,
      winRate: '63%'
    },
    {
      id: 'bot_3',
      name: 'Grok-Arb',
      strategy: 'Cross-exchange spread (Binance↔Coinbase)',
      status: 'paused',
      pnl: '+$127',
      pos: true,
      trades: 3,
      winRate: '100%'
    }
  ]);

  // Live Trades Stream
  const [tradeLogs, setTradeLogs] = useState([
    { time: '10:42', side: 'buy', pair: 'BTC/USDC', price: '$104,230', pnl: '+$180' },
    { time: '10:38', side: 'sell', pair: 'SOL/USDC', price: '$191.40', pnl: '+$45' },
    { time: '10:31', side: 'buy', pair: 'ETH/USDC', price: '$3,240', pnl: '+$120' },
    { time: '10:24', side: 'sell', pair: 'BTC/USDC', price: '$103,890', pnl: '+$310' },
    { time: '10:15', side: 'buy', pair: 'SOL/USDC', price: '$189.20', pnl: '-$22' },
    { time: '10:02', side: 'sell', pair: 'ETH/USDC', price: '$3,215', pnl: '+$85' },
  ]);

  // Sync live externalTrades received over WebSocket
  useEffect(() => {
    if (externalTrades && externalTrades.length > 0) {
      setTradeLogs(externalTrades.slice(0, 10));

      // Update token prices with latest trade data
      const latestTrade = externalTrades[0];
      if (latestTrade) {
        setTokenData(prev => prev.map(t => {
          if (latestTrade.pair.includes(t.symbol)) {
            return {
              ...t,
              value: latestTrade.price,
              change: latestTrade.side === 'buy' ? '+2.8%' : '-1.1%',
              pos: latestTrade.side === 'buy',
            };
          }
          return t;
        }));

        // Bump bot trades
        setGrokBots(prev => prev.map((b, idx) => {
          if (idx === 0) {
            return { ...b, trades: b.trades + 1 };
          }
          return b;
        }));
      }
    }
  }, [externalTrades]);

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="font-orbitron font-bold text-cyan-200">TRADING DESK & WALLET TELEMETRY</span>
        </div>
        <span className="text-[10px] text-cyan-400/80">
          Grok Autotraders Active • Gated by Adversarial Gate
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Module 1: Token Balance Wallet */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
              <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" /> TOKEN BALANCE
              </span>
              <span className="text-[11px] font-orbitron font-extrabold text-emerald-400">
                $265,510
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {tokenData.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] border-b border-cyan-500/5 pb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${t.color}`}>
                    {t.icon}
                  </span>
                  <div className="flex flex-col flex-1">
                    <span className="text-cyan-100 font-bold leading-none">{t.symbol}</span>
                    <span className="text-[9px] text-slate-400">{t.amount}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-cyan-200 font-bold">{t.value}</span>
                    <span className={`text-[8.5px] font-bold ${t.pos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-cyan-500/15 text-[10px]">
            <span className="text-slate-400 uppercase font-bold">TOTAL ASSETS:</span>
            <span className="font-orbitron font-bold text-cyan-300 text-xs">$265,510.00</span>
          </div>
        </div>

        {/* Module 2: Grok Autotrader Bots */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" /> GROK AUTOTRADER
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              3 BOTS ACTIVE
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {grokBots.map((bot) => (
              <div key={bot.id} className="p-2 rounded bg-[#091728] border border-cyan-500/15 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-100 text-[10.5px]">⚡ {bot.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${bot.status === 'running' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}`}>
                    {bot.status}
                  </span>
                </div>
                <p className="text-[9.5px] text-cyan-400/80 line-clamp-1">{bot.strategy}</p>
                <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10 text-[9.5px]">
                  <span className="font-orbitron font-bold text-emerald-400">{bot.pnl}</span>
                  <span className="text-slate-400 text-[9px]">{bot.trades} trades · {bot.winRate} win</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Live Executed Trades Stream */}
        <div className="p-3 rounded-lg bg-[#06101c]/90 border border-cyan-500/25 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1">
            <span className="font-bold text-cyan-200 text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> RECENT TRADES
            </span>
            <span className="text-[9px] text-cyan-400">STREAM ACTIVE</span>
          </div>

          <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto scrollbar-thin">
            {(externalTrades && externalTrades.length > 0 ? externalTrades : tradeLogs).map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9.5px] border-b border-cyan-500/5 pb-1">
                <span className="text-slate-400 font-mono text-[8.5px]">{t.time}</span>
                <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${t.side === 'buy' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                  {t.side.toUpperCase()}
                </span>
                <span className="text-cyan-100 font-medium">{t.pair}</span>
                <span className="text-slate-400">{t.price}</span>
                <span className={`font-bold font-mono ${t.pnl.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.pnl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
