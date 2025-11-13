import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ClientAccess() {
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const { toast } = useToast();

  const checkClientMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch(`/api/clients/phone/${phoneNumber}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to check client");
      }
      return response.json();
    },
    onSuccess: (client) => {
      if (client) {
        localStorage.setItem('clientId', client._id);
        localStorage.setItem('clientName', client.name);
        toast({
          title: `Welcome back, ${client.name}!`,
          description: "Redirecting to your dashboard...",
        });
        setTimeout(() => setLocation("/client"), 500);
      } else {
        setShowNameInput(true);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify phone number. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return response.json();
    },
    onSuccess: (client: any) => {
      localStorage.setItem('clientId', client._id);
      localStorage.setItem('clientName', client.name);
      toast({
        title: "Welcome to FitPro!",
        description: "Your account has been created successfully.",
      });
      setTimeout(() => setLocation("/client"), 500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    checkClientMutation.mutate(phone);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    createClientMutation.mutate({ name: name.trim(), phone });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-bold tracking-tight">
              FitPro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-display">Client Access</CardTitle>
              <CardDescription className="mt-2">
                {showNameInput
                  ? "Please tell us your name to get started"
                  : "Enter your phone number to access your personalized dashboard"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!showNameInput ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be your unique ID
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={checkClientMutation.isPending}
                  data-testid="button-continue"
                >
                  {checkClientMutation.isPending ? "Checking..." : "Continue"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={phone}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNameInput(false);
                      setPhone("");
                      setName("");
                    }}
                    className="flex-1"
                    data-testid="button-back"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createClientMutation.isPending}
                    data-testid="button-create-account"
                  >
                    {createClientMutation.isPending ? "Creating..." : "Get Started"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
