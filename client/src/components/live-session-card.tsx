import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video } from "lucide-react";

interface LiveSessionCardProps {
  title: string;
  trainer: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  status: "upcoming" | "live" | "completed";
  onJoin?: () => void;
}

export function LiveSessionCard({
  title,
  trainer,
  date,
  time,
  duration,
  participants,
  maxParticipants,
  status,
  onJoin,
}: LiveSessionCardProps) {
  const statusColors = {
    upcoming: "bg-chart-1",
    live: "bg-chart-3",
    completed: "bg-muted",
  };

  return (
    <Card data-testid={`card-session-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-display text-xl" data-testid="text-session-title">
            {title}
          </CardTitle>
          <Badge className={statusColors[status]} data-testid="badge-status">
            {status === "live" ? "Live Now" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-trainer">
          with {trainer}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span data-testid="text-date">{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span data-testid="text-time">{time} ({duration})</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span data-testid="text-participants">
            {participants}/{maxParticipants} participants
          </span>
        </div>
      </CardContent>
      {status !== "completed" && (
        <CardFooter>
          <Button
            className="w-full"
            variant={status === "live" ? "default" : "outline"}
            onClick={onJoin}
            disabled={status === "upcoming" && participants >= maxParticipants}
            data-testid="button-join-session"
          >
            <Video className="h-4 w-4 mr-2" />
            {status === "live" ? "Join Now" : "Reserve Spot"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
