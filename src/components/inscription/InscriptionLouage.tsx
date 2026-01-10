import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LouageFormData } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, Stepper } from '../../ui';
import Etape1InfosLegales from './louage/Etape1InfosLegales';
import Etape2InfosVehicule from './louage/Etape2InfosVehicule';
import Etape3Justificatifs from './louage/Etape3Justificatifs';
import Etape4Selfie from './louage/Etape4Selfie';

function InscriptionLouage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<LouageFormData>({
        // Étape 1
        nom: '',
        prenom: '',
        dateNaissance: '',
        adresse: '',
        telephone: '',
        email: '',
        password: '',
        numeroCIN: '',
        numeroPermis: '',
        // Étape 2
        marqueVehicule: '',
        modeleVehicule: '',
        immatriculation: '',
        nombrePlaces: 4,
        zonesDesservies: '',
        // Étape 3
        cinRecto: undefined,
        cinVerso: undefined,
        permisFile: undefined,
        // Étape 4
        selfie: undefined,
        consentement: false,
    });

    const updateFormData = (data: Partial<LouageFormData>) => {
        setFormData({ ...formData, ...data });
    };

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        // IMPORTANT: Ne PAS stocker les images (CIN, selfie) dans localStorage
        // En production: envoyer au backend sécurisé ou prestataire KYC

        const userDataToStore = {
            email: formData.email,
            password: formData.password,
            userType: 'louage' as const,
            nom: formData.nom,
            prenom: formData.prenom,
            dateNaissance: formData.dateNaissance,
            adresse: formData.adresse,
            telephone: formData.telephone,
            numeroCIN: formData.numeroCIN,
            numeroPermis: formData.numeroPermis,
            marqueVehicule: formData.marqueVehicule,
            modeleVehicule: formData.modeleVehicule,
            immatriculation: formData.immatriculation,
            nombrePlaces: formData.nombrePlaces,
            zonesDesservies: formData.zonesDesservies,
            verificationStatus: 'pending' as const,
        };

        register(userDataToStore);
        navigate('/verification-en-cours');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inscription Louage</CardTitle>
            </CardHeader>
            <CardContent>
                <Stepper
                    steps={['Infos légales', 'Véhicule', 'Justificatifs', 'Selfie']}
                    current={currentStep - 1}
                    className="mb-8"
                />

                {/* Étapes */}
                {currentStep === 1 && (
                    <Etape1InfosLegales
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                    />
                )}
                {currentStep === 2 && (
                    <Etape2InfosVehicule
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                )}
                {currentStep === 3 && (
                    <Etape3Justificatifs
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                )}
                {currentStep === 4 && (
                    <Etape4Selfie
                        formData={formData}
                        updateFormData={updateFormData}
                        prevStep={prevStep}
                        onSubmit={handleSubmit}
                    />
                )}
            </CardContent>
        </Card>
    );
}

export default InscriptionLouage;
