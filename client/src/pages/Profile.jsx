import { useEffect, useState } from 'react';
import api from '../api';
import { inputStyle, buttonStyle, formStyle } from '../styles';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', password: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/api/users/me');
                setProfile(res.data);
                setForm({ name: res.data.name || '', phone: res.data.phone || '', password: '' });
            } catch (err) {
                console.error('Failed to load profile', err);
            }
        };
        load();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/api/users/me', form);
            setProfile(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            setEditing(false);
            alert('Profile updated');
        } catch (err) {
            alert('Error updating profile');
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h2>Your Profile</h2>
            {editing ? (
                <form style={formStyle} onSubmit={handleSave}>
                    <input
                        style={inputStyle}
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        placeholder="Full Name"
                    />
                    <input
                        style={inputStyle}
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="Phone"
                    />
                    <input
                        style={inputStyle}
                        type="password"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        placeholder="New password (leave blank to keep)"
                    />
                    <button style={buttonStyle} type="submit">Save</button>
                    <button style={{...buttonStyle, background:'#ccc', color:'#000'}} type="button" onClick={()=>setEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div>
                    <p><strong>Name: </strong>{profile.name}</p>
                    <p><strong>Email: </strong>{profile.email}</p>
                    <p><strong>Phone: </strong>{profile.phone || '—'}</p>
                    <p><strong>Points: </strong>{profile.points || 0}</p>
                    <button style={buttonStyle} onClick={()=>setEditing(true)}>Edit</button>
                </div>
            )}
        </div>
    );
};

export default Profile;
