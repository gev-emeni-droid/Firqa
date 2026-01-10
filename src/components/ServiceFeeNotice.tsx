import { PASSENGER_SERVICE_FEE } from '../services/pricing';
import { Alert } from '../ui';

function ServiceFeeNotice() {
    return (
        <Alert tone="info" className="mb-6">
            <p className="font-semibold mb-1">
                💳 Frais de service Firqa : {PASSENGER_SERVICE_FEE} DT par réservation confirmée.
            </p>
            <p className="text-sm">
                Les frais de service permettent de maintenir la plateforme et d'assurer un service de qualité.
            </p>
        </Alert>
    );
}

export default ServiceFeeNotice;
