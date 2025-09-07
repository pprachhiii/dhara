import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Users, CheckCircle } from 'lucide-react';
import { Drive} from '@/lib/types';
import { useAppStore } from '@/lib/stores';

interface DriveCardProps {
  drive: Drive;
  showVoting?: boolean;
  showSignup?: boolean;
}

export function DriveCard({ drive, showVoting = true, showSignup = false }: DriveCardProps) {
  const { voteOnDrive, signupForDrive, currentUser } = useAppStore();

  const getStatusBadge = (status: Drive['status']) => {
    const statusConfig: Record<Drive['status'], { label: string; className: string }> = {
      PLANNED: { label: 'Planned', className: 'phase-progress' },
      VOTING_FINALIZED: { label: 'Voting Finalized', className: 'phase-voting' },
      ONGOING: { label: 'Ongoing', className: 'phase-progress' },
      COMPLETED: { label: 'Completed', className: 'phase-completed' },
    };
    return <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>;
  };

  const handleVote = () => voteOnDrive(drive.id);

  const handleSignup = () => {
    if (currentUser) {
      signupForDrive(drive.id, currentUser.id);
    }
  };

  // volunteer count from tasks
  const volunteerIds = (drive.tasks ?? [])
    .map((task) => task.volunteerId)
    .filter(Boolean);
  const uniqueVolunteers = new Set(volunteerIds);
  const volunteerCount = uniqueVolunteers.size;

  // tasks progress
  const completedTasks = (drive.tasks ?? []).filter((t) => t.status === "DONE").length;
  const totalTasks = (drive.tasks ?? []).length;

  // is user signed up?
  const isSignedUp = currentUser && volunteerIds.includes(currentUser.id);

  return (
    <Card className="overflow-hidden transition-smooth hover:shadow-elevated">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground mb-2 line-clamp-2">
              {drive.title}
            </h3>
            {getStatusBadge(drive.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {drive.description}
        </p>

        {/* Meta information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(drive.startDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{volunteerCount} volunteers signed up</span>
          </div>

          {(drive.status === "ONGOING" || drive.status === "COMPLETED") && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>{completedTasks}/{totalTasks} tasks completed</span>
            </div>
          )}
        </div>

        {/* Task preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-card-foreground">Tasks:</h4>
          <div className="space-y-1">
            {(drive.tasks ?? []).slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center space-x-2 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.status === "DONE" ? "bg-success" : "bg-muted-foreground"
                  }`}
                />
                <span className={`${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                  {task.report?.title ?? "Untitled Task"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {task.comfort}
                </Badge>
              </div>
            ))}
            {(drive.tasks?.length ?? 0) > 3 && (
              <div className="text-xs text-muted-foreground">
                +{drive.tasks!.length - 3} more tasks
              </div>
            )}
          </div>
        </div>

        {/* Linked reports */}
        {(drive.reports?.length ?? 0) > 0 && (
          <div className="text-xs text-muted-foreground">
            Addresses {drive.reports!.length} community report
            {drive.reports!.length > 1 ? "s" : ""}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t bg-muted/20">
        <div className="flex items-center justify-between w-full">
          {/* Voting */}
          {showVoting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-smooth"
            >
              <Heart className="h-4 w-4" />
              <span>{drive.votes?.length ?? 0}</span>
            </Button>
          )}

          {/* Signup */}
          {showSignup && !isSignedUp && (
            <Button
              onClick={handleSignup}
              size="sm"
              className="forest-gradient text-white shadow-gentle hover:shadow-accent transition-smooth"
            >
              <Users className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          )}

          {showSignup && isSignedUp && (
            <div className="flex items-center space-x-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Signed Up</span>
            </div>
          )}

          {!showVoting && !showSignup && (
            <Button variant="outline" size="sm">
              View Details
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
