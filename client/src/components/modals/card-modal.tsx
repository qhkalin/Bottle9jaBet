import { useState, useEffect } from 'react';
import { getUserCards, deleteCard, setDefaultCard } from '@/lib/monnify';
import { CardDetails } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Trash2, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CardModal({ isOpen, onClose }: CardModalProps) {
  const [cards, setCards] = useState<CardDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);
  
  const fetchCards = async () => {
    try {
      setLoading(true);
      const cards = await getUserCards();
      setCards(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast({
        title: "Error",
        description: "Could not fetch your cards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteCard = async (cardId: number) => {
    try {
      setActionInProgress(true);
      await deleteCard(cardId);
      setCards(cards.filter(card => card.id !== cardId));
      toast({
        title: "Card Removed",
        description: "Your card has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        title: "Error",
        description: "Could not delete your card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  const handleSetDefaultCard = async (cardId: number) => {
    try {
      setActionInProgress(true);
      await setDefaultCard(cardId);
      
      // Update cards state to reflect the new default
      setCards(cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      })));
      
      toast({
        title: "Default Card Set",
        description: "Your default card has been updated.",
      });
    } catch (error) {
      console.error("Error setting default card:", error);
      toast({
        title: "Error",
        description: "Could not set your default card. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  const getCardIcon = (cardType: string) => {
    // You could use more specific card icons here based on the card type
    return <CreditCard className="h-6 w-6" />;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Manage Cards</DialogTitle>
          <DialogDescription>
            View, set default, or remove your saved cards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-muted rounded-lg p-6 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Cards Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't added any cards yet. Cards will be automatically saved when you make a payment.
              </p>
              <Button onClick={onClose}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map(card => (
                <Card key={card.id} className={card.isDefault ? "border-secondary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {getCardIcon(card.cardType)}
                        <CardTitle className="ml-2">{card.cardType}</CardTitle>
                      </div>
                      {card.isDefault && (
                        <div className="bg-secondary/20 text-secondary text-xs font-semibold py-1 px-2 rounded-full">
                          Default
                        </div>
                      )}
                    </div>
                    <CardDescription>**** **** **** {card.last4}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Expires: {card.expiryMonth}/{card.expiryYear}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {!card.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSetDefaultCard(card.id)}
                        disabled={actionInProgress}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Set as Default
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCard(card.id)}
                      disabled={actionInProgress}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CardModal;
