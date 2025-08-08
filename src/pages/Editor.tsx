import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CodeEditor } from "@/components/CodeEditor";
import { UserPresence } from "@/components/UserPresence";
import { 
  Code, 
  Users, 
  Save, 
  Share, 
  LogOut, 
  Sun, 
  Moon,
  Copy,
  Download
} from "lucide-react";

const Editor = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("// Welcome to CodeCollab!\n// Start typing to begin collaborating\n\nconsole.log('Hello, World!');\n");
  const [language, setLanguage] = useState("javascript");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionName, setSessionName] = useState("My Coding Session");
  const [activeUsers, setActiveUsers] = useState<Array<{
    id: string;
    name: string;
    color: string;
    isCurrentUser: boolean;
  }>>([]);

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
  const getUserColor = (userId: string) => {
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Load session data and connect to realtime
  useEffect(() => {
    if (!sessionId || !user) return;

    const loadSession = async () => {
      const { data: session, error } = await supabase
        .from('coding_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error("Error loading session:", error);
        toast({
          title: "Error loading session",
          description: "Session not found or you don't have access",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      if (session) {
        setCode(session.code || "// Welcome to CodeCollab!\n// Start typing to begin collaborating\n\nconsole.log('Hello, World!');");
        setLanguage(session.language || "javascript");
        setSessionName(session.name || "Coding Session");
      } else {
        toast({
          title: "Session not found",
          description: "The session you're trying to access doesn't exist",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      setIsConnected(true);
    };

    const joinSession = async () => {
      // First check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipant) {
        // Update last_seen for existing participant
        const { error } = await supabase
          .from('session_participants')
          .update({ last_seen: new Date().toISOString() })
          .eq('session_id', sessionId)
          .eq('user_id', user.id);

        if (error) {
          console.error("Error updating participant:", error);
        }
      } else {
        // Insert new participant
        const { error } = await supabase
          .from('session_participants')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            user_name: user.email?.split('@')[0] || 'Anonymous',
            user_color: getUserColor(user.id),
            last_seen: new Date().toISOString()
          });

        if (error) {
          console.error("Error joining session:", error);
        }
      }
    };

    loadSession();
    joinSession();

    // Set up realtime subscriptions
    const codeChannel = supabase
      .channel('coding-session-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coding_sessions',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newSession = payload.new as any;
          setCode(newSession.code);
          setLanguage(newSession.language);
          setSessionName(newSession.name);
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('session-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          loadParticipants();
        }
      )
      .subscribe();

    const loadParticipants = async () => {
      const { data: participants, error } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes

      if (!error && participants) {
        const users = participants.map(p => ({
          id: p.user_id,
          name: p.user_name,
          color: p.user_color,
          isCurrentUser: p.user_id === user.id
        }));
        setActiveUsers(users);
      }
    };

    loadParticipants();

    // Update presence every 30 seconds
    const presenceInterval = setInterval(() => {
      supabase
        .from('session_participants')
        .update({ last_seen: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    }, 30000);

    return () => {
      supabase.removeChannel(codeChannel);
      supabase.removeChannel(participantsChannel);
      clearInterval(presenceInterval);
      
      // Clean up presence on unmount
      supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    };
  }, [sessionId, user]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Debounce the database update to avoid too many requests
    clearTimeout((window as any).codeUpdateTimeout);
    (window as any).codeUpdateTimeout = setTimeout(async () => {
      if (sessionId) {
        const { error } = await supabase
          .from('coding_sessions')
          .update({ code: newCode })
          .eq('session_id', sessionId);

        if (error) {
          console.error("Error updating code:", error);
        }
      }
    }, 1000);
  };

  const handleSave = async () => {
    if (!sessionId) return;
    
    const { error } = await supabase
      .from('coding_sessions')
      .update({ code, language })
      .eq('session_id', sessionId);

    if (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your code",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code saved",
        description: "Your code has been saved successfully",
      });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/editor/${sessionId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Session link has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language === "javascript" ? "js" : language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleLeave = () => {
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-primary" />
            <h1 className="font-semibold">{sessionName}</h1>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Session ID: {sessionId}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Label htmlFor="theme-toggle" className="text-sm">
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Label>
            <Switch
              id="theme-toggle"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>

          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>

          <Button variant="outline" size="sm" onClick={handleLeave}>
            <LogOut className="h-4 w-4 mr-1" />
            Leave
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
            theme={isDarkMode ? "vs-dark" : "vs"}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-card">
          <div className="p-4 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Active Users ({activeUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <UserPresence users={activeUsers} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="capitalize">{language}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lines:</span>
                  <span>{code.split('\n').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Characters:</span>
                  <span>{code.length}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(sessionId || '');
                    toast({ title: "Session ID copied" });
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Session ID
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;