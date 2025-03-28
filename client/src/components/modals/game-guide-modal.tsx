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
import { generateGameGuidePDF } from "@/lib/pdf-generator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Download, Mail } from "lucide-react";

type GameGuideModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sendGuideToEmail?: boolean;
};

export function GameGuideModal({ open, onOpenChange, sendGuideToEmail = false }: GameGuideModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Handle PDF download
  const handleDownloadGuide = async () => {
    setIsGenerating(true);
    try {
      await generateGameGuidePDF();
      toast({
        title: "Guide Downloaded!",
        description: "The game guide PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the guide.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-stretch sm:items-center">
          <Button
            variant="default"
            onClick={handleDownloadGuide}
            disabled={isGenerating}
            className="bg-brown-600 hover:bg-brown-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Download PDF Guide"}
          </Button>

          {user?.email && (
            <Button
              variant="outline"
              onClick={handleSendToEmail}
              disabled={isSending}
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send Guide to My Email"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}