import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HowToPlayGuide } from "@/components/game-guide/how-to-play";
import { sendGameGuideEmail } from "@/lib/email-service";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type GameGuideModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sendGuideToEmail?: boolean;
};

export function GameGuideModal({ open, onOpenChange, sendGuideToEmail = false }: GameGuideModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSendToEmail = async () => {
    if (!user?.email) return;
    
    setIsSending(true);
    try {
      const success = await sendGameGuideEmail(
        user.email, 
        user.fullName || user.username || 'User'
      );
      
      if (success) {
        toast({
          title: "Guide Sent!",
          description: "The game guide has been sent to your email.",
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to Send",
        description: "There was an error sending the guide to your email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // If sendGuideToEmail is true and we have a user email, send the guide
  // This is for automatic sending when a user first verifies their email
  if (sendGuideToEmail && user?.email && open) {
    handleSendToEmail();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Game Guide</DialogTitle>
          <DialogDescription>
            Learn how to play Bottle9jaBet and maximize your chances of winning.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <HowToPlayGuide />
        </div>
        
        {user?.email && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleSendToEmail}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send Guide to My Email"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}