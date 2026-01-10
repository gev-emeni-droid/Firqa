import { Send, MessageCircle, Phone, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, TextField } from '../../ui';

export function Aide() {
    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black mb-3 tracking-tight">Centre d'aide</h1>
                <p className="text-secondary text-lg">Comment pouvons-nous vous aider aujourd'hui ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <Card className="rounded-[2rem] shadow-xl border-none overflow-hidden">
                    <CardHeader className="bg-primary text-white p-8">
                        <CardTitle className="text-2xl flex items-center gap-3">
                            <MessageCircle /> Envoyez-nous un message
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <TextField label="Sujet" placeholder="Comment pouvons-nous vous aider ?" required />
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-muted uppercase tracking-wider">Message</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl border border-border focus:ring-2 focus:ring-accent outline-none min-h-[150px] bg-bg transition-all"
                                    placeholder="Décrivez votre problème en détail..."
                                    required
                                ></textarea>
                            </div>
                            <Button className="w-full py-4 text-lg font-bold shadow-xl shadow-primary/20">
                                Envoyer <Send size={20} className="ml-2" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Quick Help */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black tracking-tight">Questions fréquentes</h3>
                    <div className="grid gap-4">
                        {[
                            { q: "Comment réserver un trajet ?", a: "Allez sur l'accueil, choisissez votre destination et l'heure de départ." },
                            { q: "Puis-je annuler ma réservation ?", a: "Oui, jusqu'à 30 minutes avant le départ sans frais." },
                            { q: "Quels sont les modes de paiement ?", a: "Nous acceptons les cartes bancaires et le paiement mobile." },
                        ].map((faq, i) => (
                            <div key={i} className="p-6 bg-surface border border-border rounded-3xl hover:border-accent/40 transition-all duration-300">
                                <h4 className="font-black mb-2 text-primary">{faq.q}</h4>
                                <p className="text-secondary text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-surface-2/50 border border-border rounded-[2rem] mt-12 space-y-6">
                        <h3 className="font-black text-xl tracking-tight">Contact direct</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-secondary font-medium">
                                <div className="p-3 bg-surface rounded-xl shadow-sm text-accent"><Phone size={20} /></div>
                                <span>+216 71 000 000</span>
                            </div>
                            <div className="flex items-center gap-4 text-secondary font-medium">
                                <div className="p-3 bg-surface rounded-xl shadow-sm text-accent"><FileText size={20} /></div>
                                <span>support@firqa.tn</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
