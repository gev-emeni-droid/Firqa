import { useState } from 'react';
import { Lock, User, ShieldCheck, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, TextField, Alert } from '../../ui';
import { useAuth } from '../../context/AuthContext';

export function Parametres() {
    const { session } = useAuth();
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('Paramètres mis à jour avec succès !');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">Paramètres du compte</h1>
                <p className="text-secondary text-lg">Gérez vos informations personnelles et vos préférences de sécurité.</p>
            </div>

            {success && (
                <Alert tone="success" className="rounded-2xl border-none shadow-lg animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} />
                        {success}
                    </div>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <Card className="rounded-[2rem] shadow-xl border-none overflow-hidden">
                        <CardHeader className="bg-surface-2/50 p-8 border-b border-border">
                            <CardTitle className="flex items-center gap-3">
                                <User className="text-accent" /> Profil utilisateur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <TextField label="Prénom" defaultValue="Passager" />
                                    <TextField label="Nom" defaultValue="Demo" />
                                </div>
                                <TextField
                                    label="Adresse Email"
                                    type="email"
                                    defaultValue={session?.email || ''}
                                />
                                <Button type="submit" className="px-10 py-4 font-bold rounded-2xl shadow-xl shadow-primary/20">
                                    Sauvegarder les modifications
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] shadow-xl border-none overflow-hidden">
                        <CardHeader className="bg-surface-2/50 p-8 border-b border-border">
                            <CardTitle className="flex items-center gap-3">
                                <Lock className="text-accent" /> Sécurité & Mot de passe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid gap-8">
                                    <TextField label="Mot de passe actuel" type="password" />
                                    <TextField label="Nouveau mot de passe" type="password" />
                                    <TextField label="Confirmer le nouveau mot de passe" type="password" />
                                </div>
                                <Button type="submit" variant="secondary" className="px-10 py-4 font-bold rounded-2xl">
                                    Mettre à jour le mot de passe
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <div className="p-8 bg-surface-2/50 border border-border rounded-[2rem]">
                        <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-2">
                            <Bell size={20} className="text-accent" /> Notifications
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: "Alertes de trajet", desc: "Soyez prévenu quand votre chauffeur arrive." },
                                { label: "Offres spéciales", desc: "Recevez les meilleures promotions Firqa." },
                                { label: "Email de sécurité", desc: "Alertes sur les connexions de votre compte." }
                            ].map((item, i) => (
                                <label key={i} className="flex items-start gap-4 cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-accent" />
                                    <div>
                                        <div className="font-bold text-sm group-hover:text-primary transition-colors">{item.label}</div>
                                        <div className="text-xs text-secondary mt-1 tracking-wide">{item.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
