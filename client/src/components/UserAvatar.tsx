import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from 'firebase/auth';

interface UserAvatarProps {
  user: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <Avatar className={className}>
      <AvatarFallback>
        {getInitials(user.displayName, user.email || '')}
      </AvatarFallback>
    </Avatar>
  );
}