import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { StatCard } from "@/components/stat-card";
import { VideoCard } from "@/components/video-card";
import { LiveSessionCard } from "@/components/live-session-card";
import { ProgressTracker } from "@/components/progress-tracker";
import { AchievementsWidget } from "@/components/achievements-widget";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { Dumbbell, Flame, Trophy, Calendar } from "lucide-react";
import strengthImage from "@assets/generated_images/Strength_training_video_thumbnail_e7f2ebd6.png";
import yogaImage from "@assets/generated_images/Yoga_class_video_thumbnail_a8a89f8b.png";
import cardioImage from "@assets/generated_images/Cardio_workout_video_thumbnail_2c386154.png";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [videoModal, setVideoModal] = useState({ open: false, title: "", category: "", duration: "", thumbnail: "" });
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: client } = useQuery<any>({
    queryKey: ['/api/clients', clientId],
    enabled: !!clientId,
  });

  // Fetch real videos from backend
  const { data: videosData, isLoading: videosLoading } = useQuery<any[]>({
    queryKey: ['/api/videos'],
  });

  // Fetch real live sessions from backend
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
  });

  // Use real videos or show loading state
  const videos = videosData?.slice(0, 3).map((video, index) => ({
    id: video._id,
    title: video.title,
    category: video.category,
    duration: `${video.duration} min`,
    thumbnail: index % 3 === 0 ? strengthImage : index % 3 === 1 ? yogaImage : cardioImage,
    url: video.url,
  })) || [];

  // Filter upcoming sessions
  const upcomingSessions = sessionsData?.filter(s => s.status === 'upcoming')?.slice(0, 2) || [];

  const handleVideoPlay = (video: typeof videos[0]) => {
    setVideoModal({ open: true, ...video });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="dashboard" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back, {client?.name?.split(' ')[0] || 'Guest'}!</h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-2">
                <span>You're on the</span>
                <Badge className="bg-chart-2">{client?.packageId?.name || 'No'} Plan</Badge>
              </div>
            </div>
            <Button data-testid="button-start-workout">
              <Dumbbell className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Workout Streak" value="12 days" icon={Flame} trend="Keep it up!" trendUp={true} />
            <StatCard title="Sessions Completed" value={34} icon={Trophy} trend="+5 this week" trendUp={true} />
            <StatCard title="Calories Burned" value="2,450" icon={Dumbbell} trend="This week" trendUp={true} />
            <StatCard title="Next Session" value="Today 6PM" icon={Calendar} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight mb-6">Continue Watching</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      title={video.title}
                      category={video.category}
                      duration={video.duration}
                      thumbnail={video.thumbnail}
                      onPlay={() => handleVideoPlay(video)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold tracking-tight">Upcoming Live Sessions</h2>
                  <Button variant="outline" onClick={() => setLocation("/client/sessions")} data-testid="button-view-all-sessions">
                    View All
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {sessionsLoading ? (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">Loading sessions...</div>
                  ) : upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session: any) => {
                      const sessionDate = new Date(session.scheduledAt);
                      return (
                        <LiveSessionCard
                          key={session._id}
                          title={session.title}
                          trainer="HOC Trainer"
                          date={sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          time={sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          duration={`${session.duration} min`}
                          participants={session.participants || 0}
                          maxParticipants={session.maxParticipants || 15}
                          status={session.status}
                          onJoin={() => window.open(session.meetingLink, '_blank')}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">No upcoming sessions scheduled</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <ProgressTracker />
              <AchievementsWidget />
            </div>
          </div>
        </div>
      </main>

      <VideoPlayerModal
        open={videoModal.open}
        onOpenChange={(open) => setVideoModal({ ...videoModal, open })}
        videoTitle={videoModal.title}
        videoCategory={videoModal.category}
        videoDuration={videoModal.duration}
        videoThumbnail={videoModal.thumbnail}
      />
    </div>
  );
}
