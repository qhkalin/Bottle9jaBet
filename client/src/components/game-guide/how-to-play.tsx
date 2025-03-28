import { Button } from "@/components/ui/button";
import { generateGameGuidePDF } from "@/lib/pdf-generator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Download, BookOpen, Smartphone, HelpCircle, 
  Target, Settings, DollarSign, AlertCircle 
} from "lucide-react";
import { useState } from "react";

export function HowToPlayGuide() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadGuide = async () => {
    setIsGenerating(true);
    try {
      await generateGameGuidePDF();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg border-brown-500/20">
      <CardHeader className="border-b border-brown-500/10 bg-gradient-to-r from-brown-900/5 to-brown-500/5">
        <CardTitle className="text-2xl text-brown-900">How to Play Bottle9jaBet</CardTitle>
        <CardDescription>Learn the rules, strategies and tips to maximize your winning potential</CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="gameplay" className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="gameplay" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Gameplay</span>
            </TabsTrigger>
            <TabsTrigger value="winning" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Winning</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Tips</span>
            </TabsTrigger>
            <TabsTrigger value="install" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Install App</span>
            </TabsTrigger>
          </TabsList>
        </div>
      
        <CardContent className="pt-6">
          <TabsContent value="gameplay" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
                  <span className="text-brown-900 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-brown-900">Create an Account or Log In</h3>
                  <p className="text-muted-foreground text-sm">
                    Register a new account or log in to your existing account to get started.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
                  <span className="text-brown-900 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-brown-900">Deposit Funds</h3>
                  <p className="text-muted-foreground text-sm">
                    Add money to your account using any of our supported payment methods.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
                  <span className="text-brown-900 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-brown-900">Choose a Number</h3>
                  <p className="text-muted-foreground text-sm">
                    Select one of the numbers on the wheel (2, 5, 8, 10, 13, 15, 18, or 20) to place your bet on.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
                  <span className="text-brown-900 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-brown-900">Enter Bet Amount</h3>
                  <p className="text-muted-foreground text-sm">
                    Decide how much you want to bet (minimum ₦500, maximum ₦10 million).
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-brown-100 flex items-center justify-center shrink-0">
                  <span className="text-brown-900 font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-brown-900">Spin the Bottle</h3>
                  <p className="text-muted-foreground text-sm">
                    Click "Place Bet" and watch the bottle spin for 5 seconds before landing on a random number.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="winning" className="space-y-4">
            <h3 className="text-lg font-semibold text-brown-900">How Winnings Are Calculated</h3>
            <p className="text-muted-foreground">
              Your potential winnings are calculated by multiplying your stake amount by the number you bet on.
            </p>
            
            <div className="bg-brown-50 p-4 rounded-lg">
              <h4 className="font-medium text-brown-900 mb-2">Examples:</h4>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Bet ₦1,000 on number 20 and win = ₦20,000 payout</span>
                </li>
                <li className="flex gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Bet ₦500 on number 8 and win = ₦4,000 payout</span>
                </li>
                <li className="flex gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Bet ₦2,000 on number 15 and win = ₦30,000 payout</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-brown-900 mb-2">Understanding the Odds:</h4>
              <p className="text-muted-foreground">
                Each number has an equal chance of being selected when the bottle stops spinning.
                Higher numbers offer bigger payouts but have the same probability of winning as lower numbers.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            <h3 className="text-lg font-semibold text-brown-900">Tips & Strategies</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Settings className="h-5 w-5 text-brown-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-brown-900">Start Small</h4>
                  <p className="text-muted-foreground text-sm">
                    Begin with smaller bets to get a feel for the game before placing larger wagers.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Settings className="h-5 w-5 text-brown-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-brown-900">Balance Risk and Reward</h4>
                  <p className="text-muted-foreground text-sm">
                    Betting on higher numbers gives larger payouts but with the same odds as lower numbers.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Settings className="h-5 w-5 text-brown-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-brown-900">Set a Budget</h4>
                  <p className="text-muted-foreground text-sm">
                    Decide how much you're willing to spend before you start playing and stick to it.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Settings className="h-5 w-5 text-brown-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-brown-900">Take Breaks</h4>
                  <p className="text-muted-foreground text-sm">
                    Regular breaks help maintain clear thinking and prevent impulsive decisions.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-brown-900">Play Responsibly</h4>
                  <p className="text-muted-foreground text-sm">
                    Remember that betting should be fun, not a way to make money. Only bet what you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="install" className="space-y-4">
            <h3 className="text-lg font-semibold text-brown-900">Install Bottle9jaBet on Your Device</h3>
            <p className="text-muted-foreground">
              Bottle9jaBet is a Progressive Web App (PWA) that you can install on your device for quicker access.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Android Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-sm">
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open Bottle9jaBet in Chrome</li>
                    <li>Tap the menu icon (⋮)</li>
                    <li>Select "Add to Home screen"</li>
                    <li>Tap "Add" to confirm</li>
                    <li>Find the app icon on your home screen</li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">iOS Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-sm">
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open Bottle9jaBet in Safari</li>
                    <li>Tap the share icon (􀈂)</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" in the top-right corner</li>
                    <li>Find the app icon on your home screen</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">App Benefits:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Faster loading times</li>
                <li>• Works offline</li>
                <li>• App-like experience</li>
                <li>• No app store downloads required</li>
                <li>• Automatic updates</li>
              </ul>
            </div>
          </TabsContent>
        </CardContent>
      
        <Separator className="mt-2" />
        
        <CardFooter className="flex justify-between p-6">
          <div className="text-xs text-muted-foreground">
            <span className="block">18+ | Play Responsibly</span>
            <span>For entertainment purposes only</span>
          </div>
          <Button 
            variant="default" 
            size="sm"
            className="bg-brown-600 hover:bg-brown-700 text-white"
            onClick={handleDownloadGuide}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Download PDF Guide"}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
}