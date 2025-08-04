import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [code, setCode] = useState("// Welcome to CodeCollab!\n// Start typing to begin collaborating\n\nconsole.log('Hello, World!');\n");
  const [language, setLanguage] = useState("javascript");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionName] = useState("My Coding Session");

  // Mock active users - will be real Supabase data when connected
  const activeUsers = [
    { id: "1", name: "You", color: "#3b82f6", isCurrentUser: true },
    { id: "2", name: "Alice", color: "#ef4444", isCurrentUser: false },
    { id: "3", name: "Bob", color: "#10b981", isCurrentUser: false },
  ];

  useEffect(() => {
    // TODO: Connect to Supabase realtime when available
    // For now, simulate connection
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // TODO: Sync with Supabase realtime when connected
  };

  const handleSave = () => {
    // TODO: Save to Supabase database when connected
    toast({
      title: "Code saved",
      description: "Your code has been saved successfully",
    });
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