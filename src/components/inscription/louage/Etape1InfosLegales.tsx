import { useState, FormEvent } from 'react';
import { LouageFormData } from '../../../types';
import { TextField, Button, Alert } from '../../../ui';

interface Etape1Props {
    formData: LouageFormData;
    updateFormData: (data: Partial<LouageFormData>) => void;
    nextStep: () => void;
}

function Etape1InfosLegales({ formData, updateFormData, nextStep }: Etape1Props) {
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: string[] = [];

        // Validation
        if (!formData.nom) newErrors.push('Le nom est requis');
        if (!formData.prenom) newErrors.push('Le prénom est requis');
        if (!formData.dateNaissance) newErrors.push('La date de naissance est requise');
        if (!formData.adresse) newErrors.push("L'adresse est requise");
        if (!formData.telephone) newErrors.push('Le téléphone est requis');
        if (!formData.email) newErrors.push("L'email est requis");
        if (!formData.password || formData.password.length < 6) {
            newErrors.push('Le mot de passe doit contenir au moins 6 caractères');
        }
        if (!formData.numeroCIN) newErrors.push('Le numéro de CIN est requis');
        if (!formData.numeroPermis) newErrors.push('Le numéro de permis est requis');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">Étape 1 : Informations légales</h2>

            {errors.length > 0 && (
                <Alert tone="error">
                    <ul className="list-disc pl-5 m-0">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                    label="Nom"
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => updateFormData({ nom: e.target.value })}
                    placeholder="Nom"
                    required
                />
                <TextField
                    label="Prénom"
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => updateFormData({ prenom: e.target.value })}
                    placeholder="Prénom"
                    required
                />
            </div>

            <TextField
                label="Date de naissance"
                id="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => updateFormData({ dateNaissance: e.target.value })}
                required
            />

            <TextField
                label="Adresse complète"
                id="adresse"
                value={formData.adresse}
                onChange={(e) => updateFormData({ adresse: e.target.value })}
                placeholder="Adresse"
                required
            />

            <TextField
                label="Téléphone"
                id="telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => updateFormData({ telephone: e.target.value })}
                placeholder="+216 XX XXX XXX"
                required
            />

            <TextField
                label="Email"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="votre@email.com"
                autoComplete="email"
                required
            />

            <TextField
                label="Mot de passe"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                    label="Numéro CIN"
                    id="numeroCIN"
                    value={formData.numeroCIN}
                    onChange={(e) => updateFormData({ numeroCIN: e.target.value })}
                    placeholder="12345678"
                    required
                />
                <TextField
                    label="Numéro permis de conduire"
                    id="numeroPermis"
                    value={formData.numeroPermis}
                    onChange={(e) => updateFormData({ numeroPermis: e.target.value })}
                    placeholder="ABCD1234"
                    required
                />
            </div>

            <Button type="submit">
                Suivant
            </Button>
        </form>
    );
}

export default Etape1InfosLegales;
