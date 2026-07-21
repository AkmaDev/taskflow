// ===== EXERCICES : FACTORY PATTERN =====

// Exercice 1 : Système de Paiement
// Implémentez un système de paiement utilisant le Factory Pattern.

// Types disponibles
type PaymentType = 'creditcard' | 'paypal' | 'crypto';

// Interface du produit
interface PaymentProcessor {
  pay(amount: number): void;
  refund(transactionId: string): void;
}

// TODO: Implémentez les classes concrètes
// - CreditCardPayment
// - PayPalPayment
// - CryptoPayment

// TODO: Créez la Factory
// - PaymentFactory avec une méthode create typée avec l'union PaymentType
// - La méthode create doit accepter uniquement les types de l'union

// TODO: Testez votre implémentation
// - Essayez de créer chaque type de paiement
// - Vérifiez que TypeScript rejette les types invalides
