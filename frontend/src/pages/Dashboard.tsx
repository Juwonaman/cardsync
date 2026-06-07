import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PlaidLink from '../components/PlaidLink';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

interface Transaction {
  transactionId: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  merchantName: string;
}

interface Summary {
  totalSpent: number;
  transactionCount: number;
  spendingByCategory: Record<string, number>;
  spendingByCard: Record<string, number>;
  highestSpendingCategory: string;
}
interface Account {
  id: string;
  institutionName: string;
}

const COLORS = ['#0A0A0A', '#404040', '#737373', '#A3A3A3', '#D4D4D4', '#525252', '#171717'];

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FAFAFA',
    fontFamily: "'DM Sans', sans-serif",
    color: '#0A0A0A',
  },
  nav: {
    borderBottom: '1px solid #E5E5E5',
    background: '#FFFFFF',
    padding: '0 2.5rem',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  navBrand: {
    fontWeight: 600,
    fontSize: '15px',
    letterSpacing: '-0.3px',
    color: '#0A0A0A',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navUser: {
    fontSize: '13px',
    color: '#737373',
  },
  logoutBtn: {
    fontSize: '13px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #E5E5E5',
    background: '#FFFFFF',
    color: '#0A0A0A',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2.5rem 2rem',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 600,
    letterSpacing: '-0.5px',
    margin: '0 0 2rem 0',
    color: '#0A0A0A',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '10px',
    padding: '1.25rem 1.5rem',
  },
  statLabel: {
    fontSize: '12px',
    color: '#737373',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: 600,
    letterSpacing: '-0.5px',
    color: '#0A0A0A',
    fontFamily: "'DM Mono', monospace",
  },
  statSub: {
    fontSize: '12px',
    color: '#A3A3A3',
    marginTop: '4px',
  },
  connectRow: {
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  connectBtn: {
    fontSize: '13px',
    padding: '8px 16px',
    borderRadius: '7px',
    border: '1px solid #0A0A0A',
    background: '#0A0A0A',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '1rem',
    marginBottom: '2rem',
  },
  chartCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  chartTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0A0A0A',
    marginBottom: '1.25rem',
    letterSpacing: '-0.1px',
  },
  tableCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #E5E5E5',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0A0A0A',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '10px 1.5rem',
    fontSize: '11px',
    fontWeight: 600,
    color: '#A3A3A3',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    borderBottom: '1px solid #F5F5F5',
    background: '#FAFAFA',
  },
  td: {
    padding: '12px 1.5rem',
    fontSize: '13px',
    color: '#0A0A0A',
    borderBottom: '1px solid #F5F5F5',
  },
  categoryPill: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 500,
    background: '#F5F5F5',
    color: '#525252',
  },
  emptyState: {
    padding: '3rem 1.5rem',
    textAlign: 'center' as const,
    color: '#A3A3A3',
    fontSize: '14px',
  }
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);


  const fetchLinkToken = async () => {
    const response = await api.post('/api/plaid/link-token');
    setLinkToken(response.data.link_token);
  };

  const fetchTransactions = async () => {
    const response = await api.get('/api/transactions');
    setTransactions(response.data);
  };
const fetchAccounts = async () => {
  const response = await api.get('/api/plaid/accounts');
  setAccounts(response.data);
};
  const fetchSummary = async () => {
    const response = await api.get('/api/summary');
    setSummary(response.data);
  };

  useEffect(() => {
    fetchLinkToken();
    fetchTransactions();
    fetchSummary();
    fetchAccounts();
  }, []);

  const categoryData = transactions.reduce((acc: any[], tx) => {
    const cat = tx.category || 'Uncategorized';
    const existing = acc.find(item => item.name === cat);
    if (existing) {
      existing.value += Math.abs(tx.amount);
    } else {
      acc.push({ name: cat, value: Math.abs(tx.amount) });
    }
    return acc;
  }, []);

  const dailyData = transactions.reduce((acc: any[], tx) => {
    const existing = acc.find(item => item.date === tx.date);
    if (existing) {
      existing.amount += Math.abs(tx.amount);
    } else {
      acc.push({ date: tx.date, amount: Math.abs(tx.amount) });
    }
    return acc;
  }, []).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(-14);

  return (
    <div style={styles.page}>

      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.navBrand}>CardAggregator</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>{user?.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>Sign out</button>
        </div>
      </nav>

      <div style={styles.body}>
        <h1 style={styles.pageTitle}>Overview</h1>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Spent</div>
            <div style={styles.statValue}>${summary?.totalSpent.toFixed(2) ?? '0.00'}</div>
            <div style={styles.statSub}>All connected accounts</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Transactions</div>
            <div style={styles.statValue}>{summary?.transactionCount ?? 0}</div>
            <div style={styles.statSub}>Last 30 days</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Top Category</div>
            <div style={{ ...styles.statValue, fontSize: '18px', paddingTop: '4px' }}>
              {summary?.highestSpendingCategory ?? '—'}
            </div>
            <div style={styles.statSub}>Highest spend</div>
          </div>
        </div>
{/* Connected Accounts */}
{accounts.length > 0 && (
  <div style={{ marginBottom: '2rem' }}>
    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A', marginBottom: '10px' }}>
      Connected Accounts
    </div>
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
      {accounts.map(account => (
        <div key={account.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: '#FFFFFF',
          border: '1px solid #E5E5E5',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#0A0A0A',
          fontWeight: 500,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#16A34A',
          }} />
          {account.institutionName}
        </div>
      ))}
    </div>
  </div>
)}
        {/* Connect */}
        <div style={styles.connectRow}>
          {linkToken && (
            <PlaidLink linkToken={linkToken} onSuccess={() => { fetchTransactions(); fetchSummary(); }} />
          )}
          <span style={{ fontSize: '12px', color: '#A3A3A3' }}>
            {transactions.length > 0 ? `${transactions.length} transactions loaded` : 'No accounts connected yet'}
          </span>
        </div>

        {/* Charts */}
        {transactions.length > 0 && (
          <div style={styles.chartsGrid}>
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>By Category</div>
              <PieChart width={220} height={220}>
                <Pie data={categoryData} cx={105} cy={100} outerRadius={85} innerRadius={45} dataKey="value">
                  {categoryData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
              </PieChart>
              <div style={{ marginTop: '8px' }}>
                {categoryData.map((cat: any, i: number) => (
                  <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length] }} />
                      <span style={{ color: '#525252' }}>{cat.name}</span>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: '#0A0A0A', fontWeight: 500 }}>
                      ${cat.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>Daily Spending — Last 14 Days</div>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={dailyData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A3A3A3', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#A3A3A3', fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                    contentStyle={{ border: '1px solid #E5E5E5', borderRadius: '6px', fontSize: '12px', fontFamily: 'DM Sans' }}
                  />
                  <Bar dataKey="amount" fill="#0A0A0A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>Recent Transactions</div>
          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              Connect a bank account to see your transactions
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Merchant</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.transactionId}>
                    <td style={styles.td}>{tx.name}</td>
                    <td style={styles.td}>
                      <span style={styles.categoryPill}>{tx.category || 'Uncategorized'}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#737373', fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>{tx.date}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontWeight: 500, color: tx.amount > 0 ? '#EF4444' : '#16A34A' }}>
                      ${Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;