import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAndDownloadGuide } from '@/lib/comprehensive-guide';

interface DownloadGuideButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button component that generates and downloads a comprehensive game guide
 */
export function DownloadGuideButton({ 
  variant = 'default', 
  size = 'default',
  className = ''
}: DownloadGuideButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleClick = async () => {
    try {
      setIsLoading(true);
      await generateAndDownloadGuide();
      
      toast({
        title: "Guide Downloaded",
        description: "Your comprehensive game guide has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Failed to download guide:', error);
      
      toast({
        title: "Download Failed",
        description: "Could not generate the game guide. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Download Game Guide
        </>
      )}
    </Button>
  );
}

export default DownloadGuideButton;