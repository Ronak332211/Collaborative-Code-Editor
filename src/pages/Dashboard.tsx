import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, LogOut, Code } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [sessionName, setSessionName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for your coding session",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    // TODO: Create session in Supabase when connected
    const mockSessionId = Math.random().toString(36).substring(7);
    
    toast({
      title: "Session created",
      description: `Session "${sessionName}" created successfully`,
    });
    
    // Navigate to editor with session ID
    navigate(`/editor/${mockSessionId}`);
    setIsCreating(false);
  };

  const handleJoinSession = () => {
    if (!sessionId.trim()) {
      toast({
        title: "Session ID required",
        description: "Please enter a valid session ID",
        variant: "destructive",
      });
      return;
    }

    // TODO: Validate session exists in Supabase when connected
    navigate(`/editor/${sessionId}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CodeCollab</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome to CodeCollab</h2>
            <p className="text-muted-foreground">
              Create a new coding session or join an existing one to start collaborating
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Session
                </CardTitle>
                <CardDescription>
                  Start a new collaborative coding session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    placeholder="Enter session name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join Existing Session</CardTitle>
                <CardDescription>
                  Enter a session ID to join an ongoing collaboration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-id">Session ID</Label>
                  <Input
                    id="session-id"
                    placeholder="Enter session ID"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                  />
                </div>
                <Button onClick={handleJoinSession} className="w-full">
                  Join Session
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  No recent sessions. Create or join a session to get started!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;