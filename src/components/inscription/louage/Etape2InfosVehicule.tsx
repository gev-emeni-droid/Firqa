import { useState, FormEvent } from 'react';
import { LouageFormData } from '../../../types';
import { TextField, Button, Alert } from '../../../ui';

interface Etape2Props {
    formData: LouageFormData;
    updateFormData: (data: Partial<LouageFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
}

function Etape2InfosVehicule({ formData, updateFormData, nextStep, prevStep }: Etape2Props) {
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: string[] = [];

        // Validation
        if (!formData.marqueVehicule) newErrors.push('La marque est requise');
        if (!formData.modeleVehicule) newErrors.push('Le modèle est requis');
        if (!formData.immatriculation) newErrors.push("L'immatriculation est requise");
        if (!formData.nombrePlaces || formData.nombrePlaces < 1) {
            newErrors.push('Le nombre de places doit être au moins 1');
        }
        if (!formData.zonesDesservies) newErrors.push('Les zones desservies sont requises');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">Étape 2 : Informations véhicule</h2>

            {errors.length > 0 && (
                <Alert tone="error">
                    <ul className="list-disc pl-5 m-0">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                    label="Marque"
                    id="marqueVehicule"
                    value={formData.marqueVehicule}
                    onChange={(e) => updateFormData({ marqueVehicule: e.target.value })}
                    placeholder="ex: Peugeot"
                    required
                />
                <TextField
                    label="Modèle"
                    id="modeleVehicule"
                    value={formData.modeleVehicule}
                    onChange={(e) => updateFormData({ modeleVehicule: e.target.value })}
                    placeholder="ex: 508"
                    required
                />
            </div>

            <TextField
                label="Immatriculation"
                id="immatriculation"
                value={formData.immatriculation}
                onChange={(e) => updateFormData({ immatriculation: e.target.value.toUpperCase() })}
                placeholder="ex: 123 TU 1234"
                required
            />

            <TextField
                label="Nombre de places"
                id="nombrePlaces"
                type="number"
                min={1}
                max={20}
                value={formData.nombrePlaces}
                onChange={(e) => updateFormData({ nombrePlaces: parseInt(e.target.value) || 0 })}
                required
            />

            <div className="flex flex-col gap-2">
                <label htmlFor="zonesDesservies" className="text-sm font-semibold text-text">
                    Zones / Lignes desservies *
                </label>
                <textarea
                    id="zonesDesservies"
                    value={formData.zonesDesservies}
                    onChange={(e) => updateFormData({ zonesDesservies: e.target.value })}
                    placeholder="ex: Tunis - Sousse, Tunis - Sfax"
                    rows={4}
                    required
                    className="w-full p-4 rounded-xl border border-border bg-surface-2 focus:bg-surface outline-none transition-all focus:shadow-[0_0_0_4px_var(--focus)] focus:border-accent"
                    style={{
                        height: 'auto',
                        minHeight: '100px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        color: 'var(--text)'
                    }}
                />
            </div>

            <div className="flex gap-4 mt-4">
                <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                    Précédent
                </Button>
                <Button type="submit" className="flex-1">
                    Suivant
                </Button>
            </div>
        </form>
    );
}

export default Etape2InfosVehicule;
