import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DownloadGuideButton } from '@/components/game-guide/download-guide-button';
import { ServerGuideButton } from '@/components/game-guide/server-guide-button';
import { BookOpen, Mail, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface GuideDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideDownloadModal({ isOpen, onClose }: GuideDownloadModalProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();
  
  const handleSendEmailGuide = async () => {
    try {
      setIsSendingEmail(true);
      
      const res = await apiRequest('POST', '/api/email/send-game-guide');
      
      toast({
        title: "Guide Sent",
        description: "The game guide has been sent to your email.",
      });
    } catch (error) {
      console.error('Failed to send guide email:', error);
      
      toast({
        title: "Email Failed",
        description: "Could not send the game guide email. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">
            <BookOpen className="inline-block mr-2 h-5 w-5 text-secondary" />
            Bottle9jaBet Game Guide
          </DialogTitle>
          <DialogDescription>
            Get a detailed guide on how to play the game and maximize your chances of winning.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <h3 className="font-semibold">Download Options</h3>
            
            <div className="space-y-3">
              <div className="flex flex-col">
                <p className="mb-2 text-sm">Simple guide generated in your browser:</p>
                <DownloadGuideButton />
              </div>
              
              <div className="flex flex-col">
                <p className="mb-2 text-sm">Detailed guide with step-by-step instructions:</p>
                <ServerGuideButton />
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Receive via Email</h3>
            <p className="mb-3 text-sm">
              Have the guide sent to your registered email address with comprehensive instructions
              and an attached PDF.
            </p>
            
            <Button 
              variant="outline" 
              onClick={handleSendEmailGuide}
              disabled={isSendingEmail}
              className="w-full"
            >
              {isSendingEmail ? (
                <>Sending Email...</>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Guide to My Email
                </>
              )}
            </Button>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground mb-4 sm:mb-0">
            18+ | Please play responsibly
          </p>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GuideDownloadModal;