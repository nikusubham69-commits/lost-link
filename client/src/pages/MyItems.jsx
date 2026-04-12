import { useEffect, useState } from 'react';
import api from '../api';

const MyItems = () => {
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchMyItems = async () => {
            try {
                const res = await api.get('/api/items/all');
                // Only items posted by the logged-in user
                const filtered = res.data.filter(item => item.userEmail === user.email);
                setMyItems(filtered);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching items", err);
                setLoading(false);
            }
        };
        fetchMyItems();
    }, [user.email]);

    // ✅ Function 1: Mark as Resolved
    const handleResolve = async (id) => {
    if (!window.confirm("Is this item found/returned?")) return;
    try {
        await api.put(`/api/items/resolve/${id}`);
        alert("Item status updated to Resolved!");
        setMyItems(myItems.map(item => item._id === id ? {...item, isResolved: true} : item));
    } catch (err) {
        console.error("Resolve Error:", err); // <-- Variable used here!
        alert("Error updating status");
    }
};

    // 🗑️ Function 2: Permanent Delete
    const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post permanently?")) return;
    try {
        await api.delete(`/api/items/delete/${id}`);
        alert("Post deleted successfully!");
        setMyItems(myItems.filter(item => item._id !== id));
    } catch (err) {
        console.error("Delete Error:", err); // <-- Variable used here!
        alert("Error deleting post");
    }
};

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading your posts...</div>;

    return (
        <div style={{ padding: '30px', color: 'white', background: '#121212', minHeight: '100vh' }}>
            <h2 style={{ textAlign: 'center', color: '#3498db', marginBottom: '30px' }}>My Dashboard</h2>
            
            {myItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>You haven't posted any items yet.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {myItems.map(item => (
                        <div key={item._id} style={{ 
                            border: item.isResolved ? '1px solid #333' : '1px solid #444', 
                            padding: '20px', 
                            borderRadius: '12px',
                            background: '#1e1e1e',
                            opacity: item.isResolved ? 0.6 : 1,
                            transition: '0.3s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: item.isResolved ? '#666' : '#fff' }}>
                                    {item.title}
                                </h3>
                                <span style={{ 
                                    fontSize: '10px', 
                                    padding: '3px 8px', 
                                    borderRadius: '4px', 
                                    background: item.type === 'found' ? '#2ecc71' : '#e74c3c' 
                                }}>
                                    {item.type.toUpperCase()}
                                </span>
                            </div>
                            
                            <p style={{ fontSize: '14px', color: '#aaa', minHeight: '40px' }}>{item.description}</p>
                            
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                {!item.isResolved && (
                                    <button 
                                        onClick={() => handleResolve(item._id)} 
                                        style={{ ...btnBase, background: '#2ecc71' }}
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(item._id)} 
                                    style={{ ...btnBase, background: '#e74c3c' }}
                                >
                                    Delete Post
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const btnBase = {
    flex: 1,
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px'
};

export default MyItems;