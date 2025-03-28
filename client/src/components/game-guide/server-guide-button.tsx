import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServerGuideButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button component that downloads a comprehensive game guide from the server
 */
export function ServerGuideButton({ 
  variant = 'secondary', 
  size = 'default',
  className = ''
}: ServerGuideButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      // Use window.open to trigger a download from the server
      window.open('/api/guides/comprehensive', '_blank');
      
      toast({
        title: "Guide Downloaded",
        description: "Your comprehensive game guide is being downloaded.",
      });
    } catch (error) {
      console.error('Failed to download guide:', error);
      
      toast({
        title: "Download Failed",
        description: "Could not download the game guide. Please try again later.",
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
          Downloading...
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Download Comprehensive Guide
        </>
      )}
    </Button>
  );
}

export default ServerGuideButton;