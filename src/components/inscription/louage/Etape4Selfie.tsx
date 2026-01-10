import { useState, useRef, useEffect, FormEvent } from 'react';
import { LouageFormData } from '../../../types';
import { Button, Alert } from '../../../ui';

interface Etape4Props {
    formData: LouageFormData;
    updateFormData: (data: Partial<LouageFormData>) => void;
    prevStep: () => void;
    onSubmit: () => void;
}

function Etape4Selfie({ formData, updateFormData, prevStep, onSubmit }: Etape4Props) {
    const [errors, setErrors] = useState<string[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoTaken, setPhotoTaken] = useState(false);
    const [cameraError, setCameraError] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Cleanup du stream quand le composant est démonté
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        setCameraError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Erreur caméra:', err);
            setCameraError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    updateFormData({ selfie: blob });
                    setPhotoTaken(true);

                    // Arrêter le stream
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        setStream(null);
                    }
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const retakePhoto = () => {
        setPhotoTaken(false);
        updateFormData({ selfie: undefined });
        startCamera();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const newErrors: string[] = [];

        // Validation
        if (!formData.selfie) newErrors.push('Le selfie est requis');
        if (!formData.consentement) newErrors.push('Vous devez accepter le consentement');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);

        // IMPORTANT: La photo (blob) ne sera PAS stockée dans localStorage
        // En production: envoyer au backend sécurisé ou prestataire KYC avec reconnaissance faciale
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">Étape 4 : Selfie de vérification</h2>
            <Alert tone="info" className="mb-4">
                Prenez une photo de vous en direct pour vérifier votre identité
            </Alert>

            {errors.length > 0 && (
                <Alert tone="error">
                    <ul className="list-disc pl-5 m-0">
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </Alert>
            )}

            <div className="flex flex-col items-center gap-4 py-4 bg-surface-2 rounded-xl">
                {!stream && !photoTaken && (
                    <Button
                        type="button"
                        onClick={startCamera}
                    >
                        📷 Activer la caméra
                    </Button>
                )}

                {cameraError && (
                    <Alert tone="error">{cameraError}</Alert>
                )}

                {stream && !photoTaken && (
                    <div className="flex flex-col items-center gap-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full max-w-sm rounded bg-black"
                        />
                        <Button
                            type="button"
                            onClick={takePhoto}
                        >
                            📸 Prendre la photo
                        </Button>
                    </div>
                )}

                {photoTaken && (
                    <div className="flex flex-col items-center gap-4">
                        <canvas
                            ref={canvasRef}
                            className="w-full max-w-sm rounded"
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={retakePhoto}
                        >
                            🔄 Reprendre la photo
                        </Button>
                    </div>
                )}

                <canvas ref={canvasRef} style={{ display: photoTaken ? 'block' : 'none' }} className="hidden" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-2 rounded-lg">
                <input
                    type="checkbox"
                    id="consentement"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                    checked={formData.consentement}
                    onChange={(e) => updateFormData({ consentement: e.target.checked })}
                    required
                />
                <label htmlFor="consentement" className="text-sm text-text">
                    Je consens à ce que mes données personnelles et ma photo soient utilisées
                    pour vérifier mon identité. *
                </label>
            </div>

            <Alert tone="warning" className="text-xs">
                ⚠️ <strong>Note développement :</strong> Le selfie n'est PAS stocké dans localStorage.
                En production, il serait envoyé à un backend sécurisé ou un prestataire KYC certifié
                avec reconnaissance faciale pour vérifier l'identité.
            </Alert>

            <div className="flex gap-4 mt-4">
                <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                    Précédent
                </Button>
                <Button type="submit" className="flex-1">
                    Soumettre ma demande
                </Button>
            </div>
        </form>
    );
}

export default Etape4Selfie;
