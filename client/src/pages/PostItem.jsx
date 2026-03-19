import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { inputStyle, buttonStyle } from '../styles'; 

const PostItem = () => {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Electronics',
        type: 'lost',
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
            <h2 style={{ textAlign: 'center', color: '#2ecc71', marginBottom: '20px' }}>Post a New Item</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                
                <input 
                    type="text" 
                    placeholder="Item Name" 
                    style={responsiveInputStyle}
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required 
                />

                <textarea 
                    placeholder="Description..." 
                    style={{ ...responsiveInputStyle, height: '100px', resize: 'vertical' }}
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    required 
                />

                <div style={flexRowStyle}>
                    <select style={{...responsiveInputStyle, flex: 1}} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option value="Electronics">Electronics</option>
                        <option value="Books">Books</option>
                        <option value="ID Card">ID Card</option>
                        <option value="Other">Other</option>
                    </select>

                    <select style={{...responsiveInputStyle, flex: 1}} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                    </select>

<select 
    style={responsiveInputStyle} 
    onChange={(e) => setFormData({...formData, location: e.target.value})}
    required
>
    <option value="">SELECT LAST KNOWN LOCATION</option>
    <option value="GIET LIBRARY">GIET LIBRARY</option>
    <option value="CANTEEN AREA">CANTEEN AREA</option>
    <option value="BLOCK-1 (CSE)">BLOCK-1 (CSE)</option>
    <option value="AUDITORIUM">AUDITORIUM</option>
    <option value="PLAYGROUND">PLAYGROUND</option>
    <option value="HOSTEL MESS">HOSTEL MESS</option>
</select>
                </div>

                <div style={uploadBoxStyle}>
                    <label style={{ fontSize: '14px', color: '#bbb', marginBottom: '8px', display: 'block' }}>
                        📷 Upload Item Image (Optional):
                    </label>
                    <input 
                        type="file" 
                        accept="image/*"
                        style={{ width: '100%', fontSize: '12px' }}
                        onChange={(e) => setImage(e.target.files[0])} 
                    />
                </div>

                <input 
                    type="email" 
                    style={{...responsiveInputStyle, background: '#333', cursor: 'not-allowed'}}
                    value={formData.userEmail} 
                    readOnly 
                />

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
    border: '1px dashed #444',
    borderRadius: '8px',
    background: '#252525'
};

export default PostItem;