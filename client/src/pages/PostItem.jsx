import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { inputStyle, buttonStyle, fieldHintStyle } from '../styles'; 

const PostItem = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Electronics',
        type: 'lost',
        location: '',
        userEmail: userData ? userData.email : ''
    });

    const [image, setImage] = useState(null);

    useEffect(() => {
        if (!userData) {
            alert("Please login to post an item.");
            navigate('/login');
        }
    }, [userData, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('type', formData.type);
        data.append('userEmail', formData.userEmail);
        if (formData.location) {
            data.append('location', formData.location);
        }
        
        if (image) {
            data.append('image', image);
        }

        try {
            await api.post('/api/items/post', data);
            alert("Success! Your item is now live.");
            navigate('/'); 
        } catch (err) {
            alert("Error: " + (err.response?.data?.message || "Something went wrong"));
        }
    };

    return (
        <div style={formContainerStyle}>
            <h2 style={{ textAlign: 'center', color: '#7dffb3', marginBottom: '8px' }}>Post a new item</h2>
            <p style={{ textAlign: 'center', ...fieldHintStyle, marginBottom: '20px' }}>
                Each field has a clear label. What you type appears in light text for easy reading.
            </p>
            <form onSubmit={handleSubmit} style={formStyle}>
                <div>
                    <label style={fieldLabelStyle}>Item title</label>
                    <input 
                        type="text" 
                        className="readable-input"
                        placeholder="e.g. Samsung phone, ID card, wallet"
                        style={responsiveInputStyle}
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        required 
                    />
                </div>

                <div>
                    <label style={fieldLabelStyle}>Description</label>
                    <textarea 
                        className="readable-input"
                        placeholder="Color, marks, when and where seen or lost — more detail helps"
                        style={{ ...responsiveInputStyle, height: '100px', resize: 'vertical' }}
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        required 
                    />
                </div>

                <div style={flexRowStyle}>
                    <div style={{ flex: '1 1 140px' }}>
                        <label style={fieldLabelStyle}>Category</label>
                        <select className="readable-input" style={{...responsiveInputStyle, flex: 1}} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            <option value="Electronics">Electronics</option>
                            <option value="Books">Books</option>
                            <option value="ID Card">ID Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={{ flex: '1 1 140px' }}>
                        <label style={fieldLabelStyle}>Type</label>
                        <select className="readable-input" style={{...responsiveInputStyle, flex: 1}} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <label style={fieldLabelStyle}>Last known location</label>
                        <select 
                            className="readable-input"
                            style={responsiveInputStyle} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            required
                            value={formData.location || ''}
                        >
                            <option value="">— Select —</option>
                            <option value="GIET LIBRARY">GIET LIBRARY</option>
                            <option value="CANTEEN AREA">CANTEEN AREA</option>
                            <option value="BLOCK-1 (CSE)">BLOCK-1 (CSE)</option>
                            <option value="AUDITORIUM">AUDITORIUM</option>
                            <option value="PLAYGROUND">PLAYGROUND</option>
                            <option value="HOSTEL MESS">HOSTEL MESS</option>
                        </select>
                    </div>
                </div>

                <div style={uploadBoxStyle}>
                    <label style={{ fontSize: '0.9rem', color: '#d4e9ff', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                        📷 Photo (optional)
                    </label>
                    <p style={{ ...fieldHintStyle, marginBottom: '8px' }}>Upload a photo of the item to make it easier to identify.</p>
                    <input 
                        type="file" 
                        accept="image/*"
                        style={{ width: '100%', fontSize: '13px', color: '#e8f4ff' }}
                        onChange={(e) => setImage(e.target.files[0])} 
                    />
                </div>

                <div>
                    <label style={fieldLabelStyle}>Your email (login)</label>
                    <input 
                        type="email" 
                        className="readable-input"
                        style={{...responsiveInputStyle, opacity: 0.9, cursor: 'not-allowed'}}
                        value={formData.userEmail} 
                        readOnly 
                    />
                    <p style={fieldHintStyle}>Filled from your account; cannot be changed here.</p>
                </div>

                <button type="submit" style={{ ...buttonStyle, width: '100%', padding: '12px', marginTop: '10px' }}>
                    Submit Post
                </button>
            </form>
        </div>
    );
};

// --- Responsive Styles ---

const formContainerStyle = { 
    padding: '30px 15px', 
    maxWidth: '500px', 
    width: '90%', 
    margin: '30px auto', 
    color: 'white',
    background: '#1e1e1e',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
};

const formStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
};

const responsiveInputStyle = { 
    ...inputStyle, 
    width: '100%', 
    boxSizing: 'border-box', 
    padding: '12px'
};

const flexRowStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' 
};

const uploadBoxStyle = {
    padding: '12px',
    border: '1px dashed rgba(0, 212, 255, 0.35)',
    borderRadius: '8px',
    background: 'rgba(20, 30, 45, 0.9)'
};

const fieldLabelStyle = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#d4f4ff',
    marginBottom: '6px'
};

export default PostItem;