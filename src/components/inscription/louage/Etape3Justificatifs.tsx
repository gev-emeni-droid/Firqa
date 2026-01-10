import { useState, FormEvent, ChangeEvent } from 'react';
import { LouageFormData } from '../../../types';
import { Button, Alert } from '../../../ui';

interface Etape3Props {
    formData: LouageFormData;
    updateFormData: (data: Partial<LouageFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
}

function Etape3Justificatifs({ formData, updateFormData, nextStep, prevStep }: Etape3Props) {
    const [errors, setErrors] = useState<string[]>([]);
    const [previews, setPreviews] = useState<{
        cinRecto?: string;
        cinVerso?: string;
        permisFile?: string;
    }>({});

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return 'Le fichier dépasse 5 Mo';
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return 'Format non supporté (JPG, PNG, PDF uniquement)';
        }
        return null;
    };

    const createPreview = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            if (file.type === 'application/pdf') {
                resolve('📄 ' + file.name);
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, field: 'cinRecto' | 'cinVerso' | 'permisFile') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            alert(error);
            e.target.value = '';
            return;
        }

        updateFormData({ [field]: file });

        const preview = await createPreview(file);
        setPreviews({ ...previews, [field]: preview });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: string[] = [];

        // Validation
        if (!formData.cinRecto) newErrors.push('CIN recto est requis');
        if (!formData.cinVerso) newErrors.push('CIN verso est requis');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);
        nextStep();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">Étape 3 : Justificatifs</h2>
            <Alert tone="info" className="mb-4">
                Formats acceptés : JPG, PNG, PDF (max 5 Mo)
            </Alert>

            {errors.length > 0 && (
                <Alert tone="error">
                    <ul className="list-disc pl-5 m-0">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </Alert>
            )}

            <div className="flex flex-col gap-2">
                <label htmlFor="cinRecto" className="text-sm font-semibold text-text">CIN Recto *</label>
                <input
                    id="cinRecto"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'cinRecto')}
                    required
                    className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-3"
                />
                {previews.cinRecto && (
                    <div className="p-2 border rounded bg-surface-2 mt-2">
                        {previews.cinRecto.startsWith('📄') ? (
                            <div className="font-mono text-sm">{previews.cinRecto}</div>
                        ) : (
                            <img src={previews.cinRecto} alt="Aperçu CIN recto" className="max-h-48 rounded mx-auto" />
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="cinVerso" className="text-sm font-semibold text-text">CIN Verso *</label>
                <input
                    id="cinVerso"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'cinVerso')}
                    required
                    className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-3"
                />
                {previews.cinVerso && (
                    <div className="p-2 border rounded bg-surface-2 mt-2">
                        {previews.cinVerso.startsWith('📄') ? (
                            <div className="font-mono text-sm">{previews.cinVerso}</div>
                        ) : (
                            <img src={previews.cinVerso} alt="Aperçu CIN verso" className="max-h-48 rounded mx-auto" />
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="permisFile" className="text-sm font-semibold text-text">Permis de conduire (optionnel)</label>
                <input
                    id="permisFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e, 'permisFile')}
                    className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-3"
                />
                {previews.permisFile && (
                    <div className="p-2 border rounded bg-surface-2 mt-2">
                        {previews.permisFile.startsWith('📄') ? (
                            <div className="font-mono text-sm">{previews.permisFile}</div>
                        ) : (
                            <img src={previews.permisFile} alt="Aperçu permis" className="max-h-48 rounded mx-auto" />
                        )}
                    </div>
                )}
            </div>

            <Alert tone="warning" className="text-xs">
                ⚠️ <strong>Note :</strong> Les fichiers ne sont PAS stockés dans le navigateur.
                En production, ils seraient envoyés de manière sécurisée à un backend ou un prestataire KYC certifié.
            </Alert>

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

export default Etape3Justificatifs;
