import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PlaidLink from '../components/PlaidLink';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
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


const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const Dashboard = () => {
    const [summary, setSummary] = useState<Summary | null>(null);

  const { user, logout } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchLinkToken = async () => {
    const response = await api.post('/api/plaid/link-token');
    setLinkToken(response.data.link_token);
  };

  const fetchTransactions = async () => {
    const response = await api.get('/api/transactions');
    setTransactions(response.data);
  };
    const fetchSummary = async () => {
  const response = await api.get('/api/summary');
  setSummary(response.data);
    };
  useEffect(() => {
    fetchLinkToken();
    fetchTransactions();
    fetchSummary();
  }, []);

  // Calculate category spending for pie chart
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

  // Calculate daily spending for bar chart
  const dailyData = transactions.reduce((acc: any[], tx) => {
    const existing = acc.find(item => item.date === tx.date);
    if (existing) {
      existing.amount += Math.abs(tx.amount);
    } else {
      acc.push({ date: tx.date, amount: Math.abs(tx.amount) });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  const totalSpent = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Welcome, {user?.name}</h1>
        <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd' }}>
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
  <div style={{ background: '#4F46E5', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
    <div style={{ fontSize: '13px', opacity: 0.8 }}>Total Spent</div>
    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${summary?.totalSpent.toFixed(2) ?? '0.00'}</div>
  </div>
  <div style={{ background: '#7C3AED', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
    <div style={{ fontSize: '13px', opacity: 0.8 }}>Transactions</div>
    <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{summary?.transactionCount ?? 0}</div>
  </div>
  <div style={{ background: '#10B981', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
    <div style={{ fontSize: '13px', opacity: 0.8 }}>Top Category</div>
    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{summary?.highestSpendingCategory ?? 'None'}</div>
  </div>
</div>

      {/* Connect Button */}
      <div style={{ marginBottom: '2rem' }}>
        {linkToken && (
          <PlaidLink linkToken={linkToken} onSuccess={fetchTransactions} />
        )}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

        {/* Pie Chart */}
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Spending by Category</h3>
          <PieChart width={300} height={250}>
            <Pie data={categoryData} cx={140} cy={110} outerRadius={90} dataKey="value">
              {categoryData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </div>

        {/* Bar Chart */}
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Daily Spending (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
              <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <h2>Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p style={{ color: '#666' }}>No transactions yet. Connect a bank account to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', background: '#f9f9f9' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.transactionId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{tx.name}</td>
                <td style={{ padding: '10px' }}>{tx.category || 'Uncategorized'}</td>
                <td style={{ padding: '10px' }}>{tx.date}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: tx.amount > 0 ? '#EF4444' : '#10B981' }}>
                  ${Math.abs(tx.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;