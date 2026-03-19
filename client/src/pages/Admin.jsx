import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const navigate = useNavigate();
    
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user && user.role === "admin";

    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!isAdmin) {
            alert("Unauthorized! This page is for Admin only.");
            navigate('/');
        }
    }, [isAdmin, navigate]);

    
    useEffect(() => {
        const fetchAllPosts = async () => {
            if (!isAdmin) return;
            try {
                const res = await api.get('/api/items/all');
                setAllPosts(res.data);
            } catch (err) {
                console.error("Admin Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPosts();
    }, [isAdmin]);

    const deleteAnyPost = async (id) => {
        if (window.confirm("Admin Action: Delete this post permanently?")) {
            try {
                await api.delete(`/api/items/delete/${id}`);
                setAllPosts(allPosts.filter(p => p._id !== id));
            } catch (err) {
                console.error("Admin Delete Error:", err);
            }
        }
    };

    if (!isAdmin) return null;
    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading Admin Panel...</div>;

    return (
        <div style={{ padding: '30px', color: 'white', background: '#121212', minHeight: '100vh' }}>
            <h1 style={{ color: '#e74c3c', textAlign: 'center' }}>🛡️ Admin Control Panel</h1>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <p>Total Campus Posts: <strong>{allPosts.length}</strong></p>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#1e1e1e' }}>
                    <thead>
                        <tr style={{ background: '#333' }}>
                            <th style={thStyle}>Item</th>
                            <th style={thStyle}>Posted By</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPosts.map(post => (
                            <tr key={post._id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={tdStyle}>{post.title}</td>
                                <td style={tdStyle}>{post.userEmail}</td>
                                <td style={tdStyle}>
                                    <span style={{ color: post.isResolved ? '#666' : '#2ecc71' }}>
                                        {post.isResolved ? "Resolved" : "Active"}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <button onClick={() => deleteAnyPost(post._id)} style={delBtnStyle}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const thStyle = { padding: '15px', textAlign: 'left', borderBottom: '2px solid #444' };
const tdStyle = { padding: '15px' };
const delBtnStyle = { background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default Admin;