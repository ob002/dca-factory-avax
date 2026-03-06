"use client";

import { useBurnTracker } from "@/hooks/useBurnTracker";
import { useVault } from "@/hooks/useVault";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SAMPLE_VOLUME = [
  { day: "D1", cumulative: 0 },
  { day: "D2", cumulative: 0 },
  { day: "D3", cumulative: 0 },
  { day: "D4", cumulative: 0 },
  { day: "D5", cumulative: 0 },
  { day: "D6", cumulative: 0 },
  { day: "D7", cumulative: 0 },
];

const GRANT_CHECKLIST = [
  { item: "Smart contracts deployed",        done: true  },
  { item: "Contracts verified on Snowtrace", done: false },
  { item: "Unit tests passing (20/20)",      done: true  },
  { item: "Integration tests (14/14)",       done: true  },
  { item: "Fuji testnet deployment",         done: true  },
  { item: "Frontend live",                   done: true  },
  { item: "First DCA execution",             done: false },
  { item: "Mainnet deployment",              done: false },
];

function HealthScore({ vaults, txCount }: { vaults: number; txCount: number }) {
  const score = Math.min(100, (vaults > 0 ? 25 : 0) + (txCount > 0 ? 25 : 0) + 35 + 15);
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#E84142" : "#888";
  return (
    <div style={{ background: "#111", border: `1px solid ${color}`, padding: "2rem", borderRadius: "4px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: color }} />
      <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>Protocol Health Score</p>
      <div style={{ fontSize: "5rem", fontWeight: 700, color, lineHeight: 1, marginBottom: "0.5rem" }}>{score}</div>
      <p style={{ color: "#555", fontSize: "0.75rem" }}>out of 100</p>
      <div style={{ marginTop: "1.5rem", background: "#0A0A0A", borderRadius: "2px", height: "4px" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
      <p style={{ color: "#444", fontSize: "0.7rem", marginTop: "0.75rem" }}>
        {score < 100 ? `${100 - score} points to perfect score` : "Perfect score achieved"}
      </p>
    </div>
  );
}

function RetroProjection({ txCount }: { txCount: number }) {
  const gasPerTx  = 200000;
  const totalGas  = txCount * gasPerTx;
  const estAvax   = totalGas * 25 * 1e-9;
  const estUsd    = estAvax * 35;
  const retroMult = 3;
  return (
    <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px", borderLeft: "3px solid #E84142" }}>
      <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Retro9000 Grant Projection</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[
          { label: "Gas Consumed",     value: `${totalGas.toLocaleString()} units` },
          { label: "Est. Gas Cost",    value: `${estAvax.toFixed(4)} AVAX` },
          { label: "Retro Multiplier", value: `${retroMult}x` },
          { label: "Projected Reward", value: `$${(estUsd * retroMult).toFixed(2)} USD`, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #1a1a1a" }}>
            <span style={{ color: "#555", fontSize: "0.8rem" }}>{label}</span>
            <span style={{ color: highlight ? "#E84142" : "#F5F5F5", fontWeight: highlight ? 700 : 400, fontSize: highlight ? "1rem" : "0.85rem" }}>{value}</span>
          </div>
        ))}
      </div>
      <p style={{ color: "#333", fontSize: "0.7rem", marginTop: "1rem" }}>* Estimated. Actual rewards by Avalanche Foundation.</p>
    </div>
  );
}

function GrantChecklist() {
  const done  = GRANT_CHECKLIST.filter(i => i.done).length;
  const total = GRANT_CHECKLIST.length;
  const pct   = Math.round((done / total) * 100);
  return (
    <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Grant Readiness</p>
        <span style={{ color: "#E84142", fontWeight: 700, fontSize: "1.1rem" }}>{pct}%</span>
      </div>
      <div style={{ background: "#0A0A0A", borderRadius: "2px", height: "4px", marginBottom: "1.5rem" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#E84142", borderRadius: "2px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {GRANT_CHECKLIST.map(({ item, done }) => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: done ? "#22c55e" : "#333", fontSize: "0.85rem", minWidth: "16px" }}>{done ? "✓" : "○"}</span>
            <span style={{ color: done ? "#F5F5F5" : "#555", fontSize: "0.8rem" }}>{item}</span>
          </div>
        ))}
      </div>
      <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "1.5rem" }}>{done}/{total} milestones complete</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { totalGasUsed, totalTransactions } = useBurnTracker();
  const { allVaults }                       = useVault();

  const txCount    = Number(totalTransactions);
  const vaultCount = (allVaults as string[])?.length ?? 0;

  const METRICS = [
    { label: "Total Gas Tracked", value: txCount === 0 ? "0" : (totalGasUsed?.toString() ?? "0"),                                     note: "wei consumed"      },
    { label: "DCA Executions",    value: txCount.toString(),                                                                           note: "on Fuji testnet"   },
    { label: "Active Vaults",     value: vaultCount.toString(),                                                                        note: "protocol wide"     },
    { label: "Avg Gas / Tx",      value: txCount === 0 ? "—" : Math.round(Number(totalGasUsed ?? 0) / txCount).toLocaleString(),       note: "efficiency metric" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ color: "#888", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Retro9000 Tracking</p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Gas Analytics</h1>
        </div>
        <a href="https://testnet.snowtrace.io/address/0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c"
          target="_blank" rel="noreferrer"
          style={{ color: "#E84142", fontSize: "0.8rem", textDecoration: "none", border: "1px solid #E84142", padding: "0.5rem 1rem", borderRadius: "2px" }}>
          View Factory on Snowtrace →
        </a>
      </div>

      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #E84142, transparent)" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {METRICS.map(({ label, value, note }) => (
          <div key={label} style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
            <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{label}</p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#E84142", marginBottom: "0.25rem" }}>{value}</p>
            <p style={{ color: "#555", fontSize: "0.7rem" }}>{note}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <HealthScore vaults={vaultCount} txCount={txCount} />
        <RetroProjection txCount={txCount} />
      </div>

      <div style={{ background: "#111", border: "1px solid #222", padding: "2rem", borderRadius: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Cumulative USDC Volume</p>
          <span style={{ color: "#333", fontSize: "0.75rem" }}>Populates after first execution</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={SAMPLE_VOLUME}>
            <defs>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#E84142" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E84142" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#333" tick={{ fill: "#555", fontSize: 11 }} />
            <YAxis stroke="#333" tick={{ fill: "#555", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: "4px" }} labelStyle={{ color: "#888" }} itemStyle={{ color: "#E84142" }} />
            <Area type="monotone" dataKey="cumulative" stroke="#E84142" fill="url(#redGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <GrantChecklist />

      <div style={{ background: "#111", border: "1px solid #222", padding: "1.5rem", borderRadius: "4px" }}>
        <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Deployed Contracts — Fuji Testnet</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { name: "DCAFactory",      addr: "0x1d50d7D9E5bD67E5A5af9dcEd572399478EDac8c" },
            { name: "ExecutionEngine", addr: "0xC5F3786533939D240E84cF7529870474eF29f49B" },
            { name: "BurnTracker",     addr: "0xF7DadA4FF5609DAE75dc53a41EBcC31e7FCd0482" },
          ].map(({ name, addr }) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#0A0A0A", borderRadius: "2px" }}>
              <span style={{ color: "#888", fontSize: "0.8rem", minWidth: "140px" }}>{name}</span>
              <span style={{ color: "#F5F5F5", fontSize: "0.75rem", fontFamily: "monospace" }}>{addr}</span>
              <a href={`https://testnet.snowtrace.io/address/${addr}`} target="_blank" rel="noreferrer"
                style={{ color: "#E84142", fontSize: "0.75rem", textDecoration: "none", marginLeft: "1rem", whiteSpace: "nowrap" }}>
                Verify →
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
