"use client";

import { useMemo, useState } from "react";

type SearchCriteria = "phone" | "email" | "address" | "wildcard";

type ClientRow = {
  id: string;
  companyName: string;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  lastAppt?: string | null; // ISO
};

type SignedInRow = {
  apptId: string;
  clientId: string;
  companyName: string;
  time: string;
  consultant?: string | null;
};

function Panel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <div className="panel__titlebar">
        <div className="panel__title">{title}</div>
        <div>{actions}</div>
      </div>
      <div className="panel__body">{children}</div>

      <style jsx>{`
        .panel {
          background: #fff;
          border: 1px solid #cbd5e1; /* slate-300ish */
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
        }
        .panel__titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #cbd5e1;
          background: #f1f5f9; /* slate-100ish */
        }
        .panel__title {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a; /* slate-900ish */
          letter-spacing: 0.2px;
        }
        .panel__body {
          padding: 12px;
        }
      `}</style>
    </div>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="table-shell">
      {children}
      <style jsx>{`
        .table-shell {
          overflow: hidden;
          border: 1px solid #cbd5e1;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

function Th({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <th className={`th ${className || ""}`} style={style}>
      {children}
      <style jsx>{`
        .th {
          background: #172554; /* deep navy */
          color: #fff;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 10px;
          white-space: nowrap;
        }
      `}</style>
    </th>
  );
}

function Td({
  children,
  colSpan,
  className,
  style,
}: {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={`td ${className || ""}`} colSpan={colSpan} style={style}>
      {children}
      <style jsx>{`
        .td {
          padding: 8px 10px;
          font-size: 13px;
          color: #0f172a;
        }
      `}</style>
    </td>
  );
}

export default function ClientsPage() {
  const [criteria, setCriteria] = useState<SearchCriteria>("wildcard");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ClientRow[] | null>(null);
  const [signedIn, setSignedIn] = useState<SignedInRow[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const disabled = useMemo(() => !query.trim() || isSearching, [query, isSearching]);

  async function runSearch() {
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const url = new URL("/api/clients/search", window.location.origin);
      url.searchParams.set("criteria", criteria);
      url.searchParams.set("query", query.trim());
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = (await res.json()) as ClientRow[];
      setResults(data ?? []);
    } catch (err) {
      console.error(err);
      setResults([]);
      setErrorMsg(
        "Could not search clients. We can wire /api/clients/search after UI is approved."
      );
    } finally {
      setIsSearching(false);
    }
  }

  async function loadSignedIn() {
    try {
      const res = await fetch("/api/schedule/signed-in", { cache: "no-store" });
      if (!res.ok) throw new Error("signed-in fetch failed");
      const data = (await res.json()) as SignedInRow[];
      setSignedIn(data ?? []);
    } catch {
      setSignedIn([]);
    }
  }

  // initial fetch for the signed-in panel
  useState(() => {
    void loadSignedIn();
    return undefined;
  });

  return (
    <div className="page">
      <div className="page__header">
        <h1>Clients</h1>
        <a className="btn btn--ghost" href="/clients/new">
          + Add New Client
        </a>
      </div>

      <div className="grid">
        {/* Search window */}
        <div className="grid__left">
          <Panel
            title="Search"
            actions={
              <div className="hstack">
                <select
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value as SearchCriteria)}
                  className="input input--sm"
                  title="Search By Criteria"
                >
                  <option value="wildcard">Wildcard</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="address">Address</option>
                </select>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={runSearch}
                  disabled={disabled}
                >
                  {isSearching ? "Searching…" : "GO"}
                </button>
              </div>
            }
          >
            <input
              className="input input--lg mb-8"
              placeholder="Search text…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !disabled) runSearch();
              }}
            />

            {errorMsg ? <p className="msg msg--error">{errorMsg}</p> : null}

            <TableShell>
              <table className="table">
                <thead>
                  <tr>
                    <Th style={{ width: "28%" }}>Client / Office</Th>
                    <Th style={{ width: "28%" }}>Address</Th>
                    <Th style={{ width: "12%" }}>City</Th>
                    <Th style={{ width: "8%" }}>State</Th>
                    <Th style={{ width: "14%" }}>Phone</Th>
                    <Th style={{ width: "10%" }}>Last Appt</Th>
                  </tr>
                </thead>
                <tbody className="tbody">
                  {(results ?? []).length === 0 ? (
                    <tr>
                      <Td colSpan={6} className="td--muted">
                        {results === null
                          ? "Enter search text and press GO."
                          : "No matching clients found."}
                      </Td>
                    </tr>
                  ) : (
                    results!.map((c) => {
                      const addr = c.address1 || "—";
                      const lastAppt = c.lastAppt
                        ? new Date(c.lastAppt).toLocaleDateString()
                        : "—";
                      return (
                        <tr key={c.id} className="tr--hover">
                          <Td>
                            <a className="link" href={`/clients/${c.id}`}>
                              {c.companyName}
                            </a>
                          </Td>
                          <Td className="td--truncate">{addr}</Td>
                          <Td>{c.city || "—"}</Td>
                          <Td>{c.state || "—"}</Td>
                          <Td>{c.phone || "—"}</Td>
                          <Td>{lastAppt}</Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableShell>
          </Panel>
        </div>

        {/* Signed-In window */}
        <div className="grid__right">
          <Panel
            title="Clients Signed-In"
            actions={
              <button className="btn btn--ghost btn--sm" onClick={() => void loadSignedIn()}>
                Refresh
              </button>
            }
          >
            <TableShell>
              <table className="table">
                <thead>
                  <tr>
                    <Th>Client</Th>
                    <Th style={{ width: 80 }}>Time</Th>
                    <Th style={{ width: 70 }}>Emp</Th>
                  </tr>
                </thead>
                <tbody className="tbody">
                  {(signedIn ?? []).length === 0 ? (
                    <tr>
                      <Td colSpan={3} className="td--muted">
                        No clients signed in.
                      </Td>
                    </tr>
                  ) : (
                    signedIn!.map((s) => (
                      <tr key={s.apptId}>
                        <Td>
                          <a className="link" href={`/clients/${s.clientId}`}>
                            {s.companyName}
                          </a>
                        </Td>
                        <Td>{s.time}</Td>
                        <Td>{s.consultant ?? "—"}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableShell>

            <p className="subtle">
              Showing clients marked <b>Signed-In</b> on the Schedule tab.
            </p>
          </Panel>
        </div>
      </div>

      {/* Page styles (not Tailwind) */}
      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 24px auto;
          padding: 0 20px;
          color: #0f172a;
          background: #f8fafc; /* subtle app bg */
        }
        .page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 6px;
        }

        .grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }
        .grid__left,
        .grid__right {
          min-width: 0;
        }

        .hstack {
          display: inline-flex;
          gap: 8px;
          align-items: center;
        }

        .btn {
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #0f172a;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn--ghost:hover {
          background: #f8fafc;
        }
        .btn--primary {
          background: #172554;
          color: #fff;
          border-color: #172554;
        }
        .btn--primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn--sm {
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 3px;
        }

        .input {
          border: 1px solid #cbd5e1;
          background: #fff;
          border-radius: 4px;
          font-size: 13px;
          padding: 7px 8px;
          width: 100%;
          color: #0f172a;
        }
        .input--lg {
          height: 36px;
        }
        .input--sm {
          height: 32px;
          width: 180px;
        }
        .mb-8 {
          margin-bottom: 12px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .tbody tr + tr {
          border-top: 1px solid #e2e8f0;
        }
        .tr--hover:hover {
          background: #f8fafc;
        }
        .td--muted {
          text-align: center;
          color: #64748b;
          padding: 20px 10px;
        }
        .td--truncate {
          max-width: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .link {
          color: #0f172a;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: #cbd5e1;
        }
        .link:hover {
          text-decoration-color: #334155;
        }

        .msg--error {
          color: #b91c1c;
          font-size: 12px;
          margin: 4px 0 8px;
        }
        .subtle {
          margin-top: 8px;
          font-size: 11px;
          color: #64748b;
        }

        @media (max-width: 980px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}







