import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  color: string;
  isCurrentUser: boolean;
}

interface UserPresenceProps {
  users: User[];
}

export const UserPresence = ({ users }: UserPresenceProps) => {
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback 
              style={{ backgroundColor: user.color }}
              className="text-white text-xs font-medium"
            >
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium truncate">
                {user.name}
              </span>
              {user.isCurrentUser && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-xs text-muted-foreground">
                {user.isCurrentUser ? "Editing" : "Viewing"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};