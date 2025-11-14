import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { VideoCard } from "@/components/video-card";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import strengthImage from "@assets/generated_images/Strength_training_video_thumbnail_e7f2ebd6.png";
import yogaImage from "@assets/generated_images/Yoga_class_video_thumbnail_a8a89f8b.png";
import cardioImage from "@assets/generated_images/Cardio_workout_video_thumbnail_2c386154.png";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export default function ClientWorkouts() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videoModal, setVideoModal] = useState({ open: false, title: "", category: "", duration: "", thumbnail: "", url: "" });

  // Fetch real videos from backend
  const { data: videosData, isLoading } = useQuery<any[]>({
    queryKey: ['/api/videos'],
  });

  // Extract unique categories from backend data
  const categories = useMemo(() => {
    if (!videosData) return ["All"];
    const uniqueCategories = new Set(videosData.map(v => v.category));
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [videosData]);

  // Map backend videos to display format
  const allVideos = useMemo(() => {
    if (!videosData) return [];
    return videosData.map((video, index) => ({
      id: video._id,
      title: video.title,
      category: video.category,
      duration: `${video.duration} min`,
      thumbnail: video.category === "Strength" ? strengthImage : 
                 video.category === "Yoga" ? yogaImage : cardioImage,
      url: video.url,
      description: video.description,
    }));
  }, [videosData]);

  const filteredVideos = selectedCategory === "All" 
    ? allVideos 
    : allVideos.filter(v => v.category === selectedCategory);

  const handleVideoPlay = (video: typeof allVideos[0]) => {
    setVideoModal({ open: true, ...video });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="workouts" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Workout Library</h1>
            <p className="text-muted-foreground mt-1">Access all your workout videos anytime - {filteredVideos.length} videos</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className="cursor-pointer hover-elevate"
                onClick={() => setSelectedCategory(category)}
                data-testid={`badge-filter-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Loading workout videos...
              </div>
            ) : filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  category={video.category}
                  duration={video.duration}
                  thumbnail={video.thumbnail}
                  onPlay={() => handleVideoPlay(video)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No videos available in this category
              </div>
            )}
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
