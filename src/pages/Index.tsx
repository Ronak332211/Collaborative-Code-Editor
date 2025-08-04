import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Users, Zap, Shield } from "lucide-react";

const Index = () => {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Code className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              CodeCollab
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Real-time collaborative code editor where teams can write, edit, and debug code together seamlessly
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => handleNavigation("/login")}
                className="px-8"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleNavigation("/login")}
                className="px-8"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CodeCollab?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for developers who value collaboration, real-time feedback, and seamless coding experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Real-time Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Multiple developers can edit the same code simultaneously with live cursor tracking
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Code className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Syntax Highlighting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Support for JavaScript, Python, Java, C++, and many more programming languages
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Instant Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Changes are synchronized instantly across all connected users with minimal latency
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Secure Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Private coding sessions with secure authentication and access control
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Collaborating?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already using CodeCollab to build amazing projects together
          </p>
          <Button 
            size="lg" 
            onClick={() => handleNavigation("/login")}
            className="px-8"
          >
            Create Your First Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
