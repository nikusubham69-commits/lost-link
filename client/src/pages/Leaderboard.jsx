import { useEffect, useState } from 'react';
import api from '../api';
const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/api/users/leaderboard');
                setLeaders(res.data);
            } catch (err) {
                console.error('Failed to load leaderboard', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading leaderboard...</div>;
    return (
        <div style={{ padding: '30px', minHeight: '100vh', color: 'white' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🏆 Campus Leaderboard</h2>
            <table style={{ width: '100%', maxWidth: '600px', margin: 'auto', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={th}>Rank</th>
                        <th style={th}>Name</th>
                        <th style={th}>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {leaders.map((u, idx) => (
                        <tr key={u._id} style={{ background: idx % 2 === 0 ? '#1e1e1e' : '#2a2a2a' }}>
                            <td style={td}>{idx + 1}</td>
                            <td style={td}>{u.name}</td>
                            <td style={td}>{u.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
const th = { padding: '10px', textAlign: 'left', borderBottom: '1px solid #444' };
const td = { padding: '10px' };
export default Leaderboard;