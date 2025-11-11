import { PackageCard } from "@/components/package-card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dumbbell, Video, UtensilsCrossed, Calendar } from "lucide-react";
import heroImage from "@assets/generated_images/Gym_hero_background_image_43c161d8.png";

export default function Landing() {
  const packages = [
    {
      name: "Basic",
      price: 29,
      period: "month",
      features: [
        "Access to all recorded workout lectures",
        "Beginner to advanced level content",
        "New videos added weekly",
        "Mobile app access",
        "Community forum access",
      ],
    },
    {
      name: "Premium",
      price: 59,
      period: "month",
      isPopular: true,
      features: [
        "Everything in Basic",
        "Custom diet management plan",
        "Weekly nutrition consultations",
        "Personalized meal recommendations",
        "Progress tracking & analytics",
        "Priority email support",
      ],
    },
    {
      name: "Elite",
      price: 99,
      period: "month",
      features: [
        "Everything in Premium",
        "Live training sessions (4x per week)",
        "One-on-one coaching calls",
        "Personalized workout plans",
        "Priority support (24/7)",
        "Exclusive community access",
      ],
    },
  ];

  const handlePackageSelect = (packageName: string) => {
    console.log(`Selected package: ${packageName}`);
  };

  return (
    <div className="min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-display font-bold tracking-tight">
              FitPro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" data-testid="button-login">
              Login
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Gym hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center py-32">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6">
            Transform Your Fitness Journey
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Access professional workout sessions, personalized diet plans, and live training
            from certified trainers - all from the comfort of your home.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 backdrop-blur-sm"
            data-testid="button-get-started"
            onClick={() => {
              document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-display font-bold tracking-tight text-center mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and support for your fitness goals
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-chart-1 text-white w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Recorded Lectures
              </h3>
              <p className="text-sm text-muted-foreground">
                Access hundreds of professional workout videos anytime
              </p>
            </div>

            <div className="text-center">
              <div className="bg-chart-2 text-white w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Diet Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Personalized meal plans tailored to your goals
              </p>
            </div>

            <div className="text-center">
              <div className="bg-chart-3 text-white w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Live Sessions
              </h3>
              <p className="text-sm text-muted-foreground">
                Join real-time training with certified professionals
              </p>
            </div>

            <div className="text-center">
              <div className="bg-chart-4 text-white w-16 h-16 rounded-md flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-8 w-8" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                Expert Guidance
              </h3>
              <p className="text-sm text-muted-foreground">
                Get support from experienced fitness coaches
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-display font-bold tracking-tight text-center mb-4">
            Choose Your Plan
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Select the perfect package for your fitness journey. Upgrade or downgrade anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.name}
                {...pkg}
                onSelect={() => handlePackageSelect(pkg.name)}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-display font-bold">FitPro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 FitPro. Transform your fitness journey today.
          </p>
        </div>
      </footer>
    </div>
  );
}
