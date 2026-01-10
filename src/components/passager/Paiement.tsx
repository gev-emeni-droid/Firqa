import { useState } from 'react';
import { CreditCard, Plus, Trash2, ShieldCheck, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, TextField } from '../../ui';

export function Paiement() {
    const [cards, setCards] = useState([
        { id: '1', last4: '4242', brand: 'Visa', exp: '12/28' },
    ]);
    const [isAdding, setIsAdding] = useState(false);

    // Mock form state
    const [num, setNum] = useState('');
    const [exp, setExp] = useState('');
    const [cvc, setCvc] = useState('');

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        setCards([...cards, {
            id: Date.now().toString(),
            last4: num.slice(-4) || '0000',
            brand: 'MasterCard',
            exp: exp || '00/00'
        }]);
        setIsAdding(false);
        setNum('');
        setExp('');
        setCvc('');
    };

    const removeCard = (id: string) => {
        if (window.confirm('Supprimer cette carte ?')) {
            setCards(cards.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">Moyens de paiement</h1>
                <p className="text-secondary text-lg">Gérez vos options de paiement en toute sécurité.</p>
            </div>

            <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl">
                <CardHeader className="bg-surface-2/50 px-8 py-6 flex flex-row justify-between items-center border-b border-border">
                    <CardTitle className="flex items-center gap-3">
                        <CreditCard className="text-accent" /> Mes cartes enregistrées
                    </CardTitle>
                    {!isAdding && (
                        <Button size="md" onClick={() => setIsAdding(true)} className="rounded-full shadow-lg shadow-primary/20">
                            <Plus size={18} className="mr-2" /> Ajouter
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-8">
                    {cards.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center text-text-muted">
                                <CreditCard size={40} />
                            </div>
                            <p className="text-secondary font-medium">Aucune carte enregistrée.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {cards.map(card => (
                                <div key={card.id} className="group flex items-center justify-between p-6 bg-bg border border-border rounded-3xl hover:border-accent/40 transition-all duration-300">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                                            <CreditCard size={28} />
                                        </div>
                                        <div>
                                            <div className="font-black text-lg tracking-tight">{card.brand} •••• {card.last4}</div>
                                            <div className="text-sm text-text-muted font-bold uppercase tracking-widest">Expire: {card.exp}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeCard(card.id)}
                                        className="p-3 text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-all duration-300"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center gap-6 p-8 bg-surface-2/50 rounded-3xl border border-border mt-12">
                <div className="text-accent">
                    <ShieldCheck size={40} />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        Paiement 100% Sécurisé <Lock size={16} />
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed">
                        Vos informations bancaires sont chiffrées et ne sont jamais stockées sur nos serveurs. Nous utilisons des protocoles de sécurité de niveau bancaire.
                    </p>
                </div>
            </div>

            {isAdding && (
                <Card className="rounded-[2rem] border-accent/20 shadow-2xl animate-in zoom-in-95 duration-300">
                    <CardHeader className="px-8 py-6">
                        <CardTitle>Ajouter une nouvelle carte</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleAddCard} className="space-y-6">
                            <div className="grid gap-6">
                                <TextField
                                    label="Numéro de carte"
                                    placeholder="0000 0000 0000 0000"
                                    value={num}
                                    onChange={e => setNum(e.target.value)}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-6">
                                    <TextField
                                        label="Expiration (MM/AA)"
                                        placeholder="MM/AA"
                                        value={exp}
                                        onChange={e => setExp(e.target.value)}
                                        required
                                    />
                                    <TextField
                                        label="CVC"
                                        placeholder="123"
                                        value={cvc}
                                        onChange={e => setCvc(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button type="submit" className="flex-1 py-4 font-bold shadow-xl shadow-primary/20">Enregistrer</Button>
                                <Button type="button" variant="secondary" onClick={() => setIsAdding(false)} className="px-10 py-4 font-bold">
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
