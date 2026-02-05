"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  orderId: string;
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({
  orderId,
  total,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}/confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Handle 3D Secure authentication failures and other errors
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message || "Payment failed");
          onError(error.message || "Payment failed");
        } else {
          setErrorMessage("An unexpected error occurred");
          onError("An unexpected error occurred");
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // 3D Secure is being handled
        setErrorMessage("Additional authentication required");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("Failed to process payment");
      onError("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
          business: {
            name: "Cocoa & Co",
          },
        }}
      />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || isProcessing}
        data-testid="pay-button"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay ${total.toFixed(2)}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Your payment is secured by Stripe
      </p>
    </form>
  );
}
