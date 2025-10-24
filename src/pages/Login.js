import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logowhite.png';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('https://api.safimayi.com/api/users/login/', {
                email,
                password,
            });
            if (response.data.user.role !== "agent" && response.data.user.role !== "admin") {
                navigate('/404');
            }
            else {
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                // sauvegarder user dans localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // notifier la page courante (même onglet) que l'utilisateur a changé
                window.dispatchEvent(new Event('user-changed'));
                // navigation classique sans forcer reload
                navigate('/dashboard');
            }
        }
        catch {
            setError('Email ou mot de passe incorrect');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Box, { sx: {
            minHeight: '100vh',
            background: 'linear-gradient(to right, #002445, #002445)',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
        }, children: [_jsx("img", { src: logo, alt: "SafiMayi Logo", width: 180, style: { marginBottom: '20px', marginTop: '90px' } }), _jsx(Container, { sx: { mt: 0 }, maxWidth: "sm", children: _jsxs(Paper, { elevation: 6, sx: { p: 4, backgroundColor: '#fff', borderRadius: 2 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, align: "center", children: "Connexion" }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(TextField, { label: "Email", variant: "outlined", fullWidth: true, margin: "normal", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading }), _jsx(TextField, { label: "Mot de passe", type: "password", variant: "outlined", fullWidth: true, margin: "normal", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading }), _jsx(Box, { sx: { textAlign: 'right', mb: 2 }, children: _jsx(Link, { href: "#", variant: "body2", sx: { color: '#0486d9' }, children: "Mot de passe oubli\u00E9 ?" }) }), _jsx(Button, { variant: "contained", color: "primary", fullWidth: true, type: "submit", sx: { mt: 2, backgroundColor: '#0486d9', '&:hover': { backgroundColor: '#004574ff' }, height: '50px' }, disabled: loading, children: loading ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : 'Se connecter' })] })] }) })] }));
};
export default Login;
