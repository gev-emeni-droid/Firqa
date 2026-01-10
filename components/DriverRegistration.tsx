import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, CreditCard, Shield, Camera, Upload, Check, AlertCircle, FileText, Car, Calendar } from 'lucide-react';

interface DriverRegistrationProps {
  onClose: () => void;
  onSubmit: (driverData: any) => void;
}

interface FormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;

  // Informations véhicule
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;

  // Documents
  idCardFront: File | null;
  idCardBack: File | null;
  driverLicense: File | null;
  vehicleRegistration: File | null;
  insuranceCertificate: File | null;

  // Informations bancaires
  bankName: string;
  accountHolder: string;
  iban: string;
  rib: File | null;

  // Reconnaissance faciale
  facialRecognitionComplete: boolean;

  // Acceptation conditions
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptDataProcessing: boolean;
}

const DriverRegistration: React.FC<DriverRegistrationProps> = ({ onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    idCardFront: null,
    idCardBack: null,
    driverLicense: null,
    vehicleRegistration: null,
    insuranceCertificate: null,
    bankName: '',
    accountHolder: '',
    iban: '',
    rib: null,
    facialRecognitionComplete: false,
    acceptTerms: false,
    acceptPrivacy: false,
    acceptDataProcessing: false
  });

  const [errors, setErrors] = useState<any>({});

  const vehicleBrands = [
    'Renault', 'Peugeot', 'Citroën', 'Volkswagen', 'Ford', 'Opel', 'Toyota', 'Nissan',
    'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Audi', 'Skoda', 'Seat', 'Dacia'
  ];

  const vehicleColors = [
    'Blanc', 'Noir', 'Gris', 'Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Argent', 'Bronze'
  ];

  const handleFileUpload = (fieldName: keyof FormData, file: File) => {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    switch (step) {
      case 1: // Informations personnelles
        if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
        if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
        if (!formData.email.trim()) newErrors.email = 'Email requis';
        if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date de naissance requise';
        if (!formData.address.trim()) newErrors.address = 'Adresse requise';
        break;

      case 2: // Informations véhicule
        if (!formData.vehicleBrand.trim()) newErrors.vehicleBrand = 'Marque requise';
        if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Modèle requis';
        if (!formData.vehicleYear.trim()) newErrors.vehicleYear = 'Année requise';
        if (!formData.vehicleColor.trim()) newErrors.vehicleColor = 'Couleur requise';
        if (!formData.licensePlate.trim()) newErrors.licensePlate = 'Immatriculation requise';
        break;

      case 3: // Documents
        if (!formData.idCardFront) newErrors.idCardFront = 'Carte d\'identité recto requise';
        if (!formData.idCardBack) newErrors.idCardBack = 'Carte d\'identité verso requise';
        if (!formData.driverLicense) newErrors.driverLicense = 'Permis de conduire requis';
        if (!formData.vehicleRegistration) newErrors.vehicleRegistration = 'Carte grise requise';
        if (!formData.insuranceCertificate) newErrors.insuranceCertificate = 'Assurance requise';
        break;

      case 4: // Informations bancaires
        if (!formData.bankName.trim()) newErrors.bankName = 'Nom de la banque requis';
        if (!formData.accountHolder.trim()) newErrors.accountHolder = 'Titulaire du compte requis';
        if (!formData.iban.trim()) newErrors.iban = 'IBAN requis';
        if (!formData.rib) newErrors.rib = 'RIB requis';
        break;

      case 5: // Reconnaissance faciale
        if (!formData.facialRecognitionComplete) newErrors.facialRecognition = 'Vérification faciale requise';
        break;

      case 6: // Validation finale
        if (!formData.acceptTerms) newErrors.acceptTerms = 'Acceptation des conditions requise';
        if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'Acceptation de la politique de confidentialité requise';
        if (!formData.acceptDataProcessing) newErrors.acceptDataProcessing = 'Acceptation du traitement des données requise';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(7)) {
      onSubmit(formData);
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informations personnelles</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Votre prénom"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Votre nom"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="votre.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="+216 XX XXX XXX"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date de naissance *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse complète *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                rows={3}
                placeholder="Votre adresse complète..."
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informations véhicule</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Marque *</label>
                <select
                  value={formData.vehicleBrand}
                  onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleBrand ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Sélectionner...</option>
                  {vehicleBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.vehicleBrand && <p className="text-red-500 text-xs mt-1">{errors.vehicleBrand}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Modèle *</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleModel ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Modèle du véhicule"
                />
                {errors.vehicleModel && <p className="text-red-500 text-xs mt-1">{errors.vehicleModel}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Année *</label>
                <input
                  type="number"
                  value={formData.vehicleYear}
                  onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleYear ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear()}
                />
                {errors.vehicleYear && <p className="text-red-500 text-xs mt-1">{errors.vehicleYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Couleur *</label>
                <select
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleColor ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Sélectionner...</option>
                  {vehicleColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                {errors.vehicleColor && <p className="text-red-500 text-xs mt-1">{errors.vehicleColor}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Immatriculation *</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.licensePlate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="123 TU 4567"
                />
                {errors.licensePlate && <p className="text-red-500 text-xs mt-1">{errors.licensePlate}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Documents obligatoires</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Shield className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900">Confidentialité des données</p>
                  <p className="text-xs text-blue-700">
                    Vos données d'identité sont utilisées uniquement pour la vérification initiale et ne sont pas conservées
                    par la plateforme après validation de votre compte.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Carte d'identité - Recto *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('idCardFront', e.target.files[0])}
                    className="hidden"
                    id="idCardFront"
                  />
                  <label htmlFor="idCardFront" className="cursor-pointer">
                    {formData.idCardFront ? (
                      <div className="space-y-2">
                        <Check className="mx-auto text-green-600" size={24} />
                        <p className="text-sm font-bold text-green-600">{formData.idCardFront.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="mx-auto text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                        <p className="text-xs text-gray-500">Formats: JPG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.idCardFront && <p className="text-red-500 text-xs mt-1">{errors.idCardFront}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Carte d'identité - Verso *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('idCardBack', e.target.files[0])}
                    className="hidden"
                    id="idCardBack"
                  />
                  <label htmlFor="idCardBack" className="cursor-pointer">
                    {formData.idCardBack ? (
                      <div className="space-y-2">
                        <Check className="mx-auto text-green-600" size={24} />
                        <p className="text-sm font-bold text-green-600">{formData.idCardBack.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="mx-auto text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                        <p className="text-xs text-gray-500">Formats: JPG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.idCardBack && <p className="text-red-500 text-xs mt-1">{errors.idCardBack}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Permis de conduire *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('driverLicense', e.target.files[0])}
                    className="hidden"
                    id="driverLicense"
                  />
                  <label htmlFor="driverLicense" className="cursor-pointer">
                    {formData.driverLicense ? (
                      <div className="space-y-2">
                        <Check className="mx-auto text-green-600" size={24} />
                        <p className="text-sm font-bold text-green-600">{formData.driverLicense.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="mx-auto text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                        <p className="text-xs text-gray-500">Formats: JPG, PNG (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.driverLicense && <p className="text-red-500 text-xs mt-1">{errors.driverLicense}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Carte grise *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('vehicleRegistration', e.target.files[0])}
                    className="hidden"
                    id="vehicleRegistration"
                  />
                  <label htmlFor="vehicleRegistration" className="cursor-pointer">
                    {formData.vehicleRegistration ? (
                      <div className="space-y-2">
                        <Check className="mx-auto text-green-600" size={24} />
                        <p className="text-sm font-bold text-green-600">{formData.vehicleRegistration.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                        <p className="text-xs text-gray-500">Formats: JPG, PNG, PDF (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.vehicleRegistration && <p className="text-red-500 text-xs mt-1">{errors.vehicleRegistration}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Certificat d'assurance *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('insuranceCertificate', e.target.files[0])}
                    className="hidden"
                    id="insuranceCertificate"
                  />
                  <label htmlFor="insuranceCertificate" className="cursor-pointer">
                    {formData.insuranceCertificate ? (
                      <div className="space-y-2">
                        <Check className="mx-auto text-green-600" size={24} />
                        <p className="text-sm font-bold text-green-600">{formData.insuranceCertificate.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileText className="mx-auto text-gray-400" size={24} />
                        <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                        <p className="text-xs text-gray-500">Formats: JPG, PNG, PDF (max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.insuranceCertificate && <p className="text-red-500 text-xs mt-1">{errors.insuranceCertificate}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informations bancaires</h3>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <CreditCard className="text-green-600 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-green-900">Sécurité des paiements</p>
                  <p className="text-xs text-green-700">
                    Vos informations bancaires sont cryptées et utilisées uniquement pour la gestion de votre cagnotte
                    et le paiement de vos commissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la banque *</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ex: BIAT, STB, BNA..."
                />
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titulaire du compte *</label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.accountHolder ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Nom du titulaire du compte"
                />
                {errors.accountHolder && <p className="text-red-500 text-xs mt-1">{errors.accountHolder}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">IBAN *</label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.iban ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="TN59 XXXX XXXX XXXX XXXX XXXX XXXX"
              />
              {errors.iban && <p className="text-red-500 text-xs mt-1">{errors.iban}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Relevé d'Identité Bancaire (RIB) *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('rib', e.target.files[0])}
                  className="hidden"
                  id="rib"
                />
                <label htmlFor="rib" className="cursor-pointer">
                  {formData.rib ? (
                    <div className="space-y-2">
                      <Check className="mx-auto text-green-600" size={24} />
                      <p className="text-sm font-bold text-green-600">{formData.rib.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="mx-auto text-gray-400" size={24} />
                      <p className="text-sm text-gray-600">Cliquez pour télécharger votre RIB</p>
                      <p className="text-xs text-gray-500">Formats: JPG, PNG, PDF (max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.rib && <p className="text-red-500 text-xs mt-1">{errors.rib}</p>}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={40} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reconnaissance faciale</h3>
              <p className="text-sm text-gray-600 mt-2">
                Veuillez vous placer face à la caméra pour vérifier votre identité.
              </p>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border-4 border-dashed border-gray-300">
              {!formData.facialRecognitionComplete ? (
                <div className="text-center p-6">
                  <div className="w-48 h-48 border-4 border-blue-500 rounded-full border-t-transparent animate-spin mx-auto mb-4" />
                  <p className="text-white font-bold">Positionnez votre visage dans le cadre</p>
                  <button
                    onClick={() => setFormData({ ...formData, facialRecognitionComplete: true })}
                    className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Capturer le visage
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 bg-green-500/20 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <Check size={40} className="text-white" />
                  </div>
                  <p className="text-white text-xl font-bold">Visage capturé avec succès !</p>
                  <button
                    onClick={() => setFormData({ ...formData, facialRecognitionComplete: false })}
                    className="mt-4 text-white underline text-sm"
                  >
                    Recommencer
                  </button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
              <Shield className="text-blue-600 mt-1" size={18} />
              <p className="text-xs text-blue-800">
                Cette étape est obligatoire pour garantir la sécurité de la plateforme et prévenir l'usurpation d'identité. Nos algorithmes analysent uniquement les points biométriques de manière sécurisée.
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#B08968] to-[#8c6a4f] p-6 text-white rounded-[2rem] shadow-lg">
              <h3 className="text-xl font-black mb-2 tracking-tight">Abonnement Mensuel FIRQA</h3>
              <p className="text-sm opacity-90 mb-4">Le premier mois d'abonnement est requis pour activer votre compte chauffeur.</p>
              <div className="text-4xl font-black">29.90 <span className="text-lg opacity-80 font-bold">TND / mois</span></div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-600" /> Coordonnées bancaires
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la banque *</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Ex: BIAT, STB..."
                  />
                  {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Titulaire du compte *</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.accountHolder ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Nom sur la carte"
                  />
                  {errors.accountHolder && <p className="text-red-500 text-xs mt-1">{errors.accountHolder}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">IBAN *</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.iban ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="TN59 XXXX..."
                />
                {errors.iban && <p className="text-red-500 text-xs mt-1">{errors.iban}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Télécharger votre RIB (PDF/Image) *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-all cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    id="ribUpload"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('rib', e.target.files[0])}
                  />
                  <label htmlFor="ribUpload" className="cursor-pointer">
                    {formData.rib ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                        <Check size={20} /> {formData.rib.name}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">Cliquez pour ajouter votre RIB</p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.rib && <p className="text-red-500 text-xs mt-1">{errors.rib}</p>}
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-3">
              <Lock size={18} className="text-green-600" />
              <p className="text-xs text-gray-600">
                Vos coordonnées bancaires seront prélevées mensuellement pour l'abonnement. Le premier paiement de 29.90 TND sera effectué après validation de votre compte par nos équipes.
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Validation finale</h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 mt-1" size={20} />
                <div>
                  <p className="text-sm font-bold text-yellow-900">Vérification obligatoire</p>
                  <p className="text-xs text-yellow-700">
                    Tous les documents et informations seront vérifiés avant validation de votre compte.
                    Le processus peut prendre 24-48h.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  J'accepte les <span className="font-bold">conditions générales d'utilisation</span> de la plateforme FIRQA
                </span>
              </label>
              {errors.acceptTerms && <p className="text-red-500 text-xs ml-7">{errors.acceptTerms}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  J'ai lu et j'accepte la <span className="font-bold">politique de confidentialité</span> concernant mes données personnelles
                </span>
              </label>
              {errors.acceptPrivacy && <p className="text-red-500 text-xs ml-7">{errors.acceptPrivacy}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptDataProcessing}
                  onChange={(e) => setFormData({ ...formData, acceptDataProcessing: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  J'accepte le <span className="font-bold">traitement de mes données</span> pour la gestion des paiements et commissions
                </span>
              </label>
              {errors.acceptDataProcessing && <p className="text-red-500 text-xs ml-7">{errors.acceptDataProcessing}</p>}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h4 className="font-bold text-sm text-gray-900 mb-3">Récapitulatif de votre inscription</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom complet:</span>
                  <span className="font-bold">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-bold">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Téléphone:</span>
                  <span className="font-bold">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Véhicule:</span>
                  <span className="font-bold">{formData.vehicleBrand} {formData.vehicleModel} ({formData.vehicleYear})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Immatriculation:</span>
                  <span className="font-bold">{formData.licensePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vérification faciale:</span>
                  <span className={`font-bold ${formData.facialRecognitionComplete ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.facialRecognitionComplete ? 'Effectuée' : 'Non effectuée'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Banque:</span>
                  <span className="font-bold">{formData.bankName}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Car size={28} />
              <h2 className="text-2xl font-black">Inscription Chauffeur FIRQA</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step <= currentStep
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white'
                    }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${step < currentStep ? 'bg-white' : 'bg-white/20'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-sm">
            {currentStep === 1 && 'Informations personnelles'}
            {currentStep === 2 && 'Informations véhicule'}
            {currentStep === 3 && 'Documents obligatoires'}
            {currentStep === 4 && 'Informations bancaires'}
            {currentStep === 5 && 'Validation finale'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {renderStep()}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {currentStep < 7 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                Soumettre l'inscription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration;
