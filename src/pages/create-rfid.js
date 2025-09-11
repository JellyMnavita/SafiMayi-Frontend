import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
const CreateRFIDCard = () => {
    const [codeUid, setCodeUid] = useState('');
    const [telephone, setTelephone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('https://safimayi-backend.onrender.com/api/rfid/create/', {
                code_uid: codeUid,
                telephone: telephone
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setSuccess('Carte RFID créée avec succès!');
            setCodeUid('');
            setTelephone('');
        }
        catch (err) {
            setError('Erreur lors de la création de la carte RFID');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            paddingTop: 4,
        }, children: _jsx(Container, { maxWidth: "sm", children: _jsxs(Paper, { elevation: 6, sx: { p: 4, backgroundColor: '#fff', borderRadius: 2 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, align: "center", children: "Cr\u00E9er une carte RFID" }), error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), success && _jsx(Alert, { severity: "success", sx: { mb: 2 }, children: success }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(TextField, { label: "Code UID de la carte", variant: "outlined", fullWidth: true, margin: "normal", value: codeUid, onChange: (e) => setCodeUid(e.target.value), disabled: loading, required: true }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", variant: "outlined", fullWidth: true, margin: "normal", value: telephone, onChange: (e) => setTelephone(e.target.value), disabled: loading, required: true }), _jsx(Button, { variant: "contained", color: "primary", fullWidth: true, type: "submit", sx: {
                                    mt: 2,
                                    backgroundColor: '#0486d9',
                                    '&:hover': { backgroundColor: '#004574ff' },
                                    height: '50px'
                                }, disabled: loading, children: loading ? _jsx(CircularProgress, { size: 24, color: "inherit" }) : 'Créer la carte' })] })] }) }) }));
};
export default CreateRFIDCard;
