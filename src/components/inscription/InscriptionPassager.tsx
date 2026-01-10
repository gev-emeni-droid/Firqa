import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, TextField, Alert } from '../../ui';

function InscriptionPassager() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        nom: '',
        telephone: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.nom || !formData.telephone || !formData.email || !formData.password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        // Enregistrer l'utilisateur
        register({
            email: formData.email,
            password: formData.password,
            userType: 'passager',
            nom: formData.nom,
            telephone: formData.telephone,
        });

        // Rediriger vers choix-role
        navigate('/choix-role');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inscription Passager</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && <Alert tone="error">{error}</Alert>}

                    <TextField
                        label="Nom complet"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                    />

                    <TextField
                        label="Téléphone"
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="+216 XX XXX XXX"
                        required
                    />

                    <TextField
                        label="Email"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        autoComplete="email"
                        required
                    />

                    <TextField
                        label="Mot de passe"
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 caractères"
                        autoComplete="new-password"
                        required
                    />

                    <Button type="submit" fullWidth>
                        S'inscrire
                    </Button>
                </form>
            </CardContent>
            <CardFooter style={{ textAlign: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                <span className="text-secondary text-sm">Déjà un compte ?</span>
                <Button variant="ghost" size="md" onClick={() => navigate('/connexion')} style={{ padding: '0 8px', height: 'auto' }}>
                    Se connecter
                </Button>
            </CardFooter>
        </Card>
    );
}

export default InscriptionPassager;
