import mongoose from 'mongoose';
import {
  Package,
  Client,
  BodyMetrics,
  Video,
  ClientVideo,
  WorkoutPlan,
  DietPlan,
  LiveSession,
  SessionClient,
  WorkoutSession,
  VideoProgress,
  VideoBookmark,
  ProgressPhoto,
  Achievement,
  Goal,
  type IPackage,
  type IClient,
  type IBodyMetrics,
  type IVideo,
  type IClientVideo,
  type IWorkoutPlan,
  type IDietPlan,
  type ILiveSession,
  type ISessionClient,
  type IWorkoutSession,
  type IVideoProgress,
  type IVideoBookmark,
  type IProgressPhoto,
  type IAchievement,
  type IGoal,
} from './models';

export interface IStorage {
  // Package methods
  getAllPackages(): Promise<IPackage[]>;
  getPackage(id: string): Promise<IPackage | null>;
  createPackage(data: Partial<IPackage>): Promise<IPackage>;
  updatePackage(id: string, data: Partial<IPackage>): Promise<IPackage | null>;
  
  // Client methods
  getAllClients(): Promise<IClient[]>;
  getClient(id: string): Promise<IClient | null>;
  getClientByPhone(phone: string): Promise<IClient | null>;
  createClient(data: Partial<IClient>): Promise<IClient>;
  updateClient(id: string, data: Partial<IClient>): Promise<IClient | null>;
  deleteClient(id: string): Promise<boolean>;
  
  // Body Metrics methods
  getClientBodyMetrics(clientId: string): Promise<IBodyMetrics[]>;
  createBodyMetrics(data: Partial<IBodyMetrics>): Promise<IBodyMetrics>;
  getLatestBodyMetrics(clientId: string): Promise<IBodyMetrics | null>;
  
  // Video methods
  getAllVideos(): Promise<IVideo[]>;
  getVideo(id: string): Promise<IVideo | null>;
  createVideo(data: Partial<IVideo>): Promise<IVideo>;
  updateVideo(id: string, data: Partial<IVideo>): Promise<IVideo | null>;
  deleteVideo(id: string): Promise<boolean>;
  getVideosByPackage(packageId: string): Promise<IVideo[]>;
  searchVideos(filters: {
    category?: string;
    duration?: { min?: number; max?: number };
    intensity?: string;
    trainer?: string;
    search?: string;
  }): Promise<IVideo[]>;
  
  // Client Video methods
  getClientVideos(clientId: string): Promise<IVideo[]>;
  assignVideoToClient(clientId: string, videoId: string): Promise<IClientVideo>;
  removeVideoFromClient(clientId: string, videoId: string): Promise<boolean>;
  
  // Video Progress methods
  getVideoProgress(clientId: string, videoId: string): Promise<IVideoProgress | null>;
  updateVideoProgress(clientId: string, videoId: string, watchedDuration: number, totalDuration: number): Promise<IVideoProgress>;
  getContinueWatching(clientId: string): Promise<any[]>;
  
  // Video Bookmark methods
  getVideoBookmarks(clientId: string): Promise<any[]>;
  createVideoBookmark(clientId: string, videoId: string): Promise<IVideoBookmark>;
  deleteVideoBookmark(clientId: string, videoId: string): Promise<boolean>;
  isVideoBookmarked(clientId: string, videoId: string): Promise<boolean>;
  
  // Progress Photo methods
  getProgressPhotos(clientId: string): Promise<IProgressPhoto[]>;
  createProgressPhoto(data: Partial<IProgressPhoto>): Promise<IProgressPhoto>;
  deleteProgressPhoto(clientId: string, photoId: string): Promise<boolean>;
  
  // Workout Plan methods
  getClientWorkoutPlans(clientId: string): Promise<IWorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<IWorkoutPlan | null>;
  createWorkoutPlan(data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan>;
  updateWorkoutPlan(id: string, data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null>;
  deleteWorkoutPlan(id: string): Promise<boolean>;
  
  // Diet Plan methods
  getClientDietPlans(clientId: string): Promise<IDietPlan[]>;
  getDietPlan(id: string): Promise<IDietPlan | null>;
  createDietPlan(data: Partial<IDietPlan>): Promise<IDietPlan>;
  updateDietPlan(id: string, data: Partial<IDietPlan>): Promise<IDietPlan | null>;
  deleteDietPlan(id: string): Promise<boolean>;
  
  // Live Session methods
  getAllSessions(): Promise<ILiveSession[]>;
  getSession(id: string): Promise<ILiveSession | null>;
  createSession(data: Partial<ILiveSession>): Promise<ILiveSession>;
  updateSession(id: string, data: Partial<ILiveSession>): Promise<ILiveSession | null>;
  deleteSession(id: string): Promise<boolean>;
  getClientSessions(clientId: string): Promise<ILiveSession[]>;
  
  // Session Client methods
  assignClientToSession(sessionId: string, clientId: string): Promise<ISessionClient>;
  removeClientFromSession(sessionId: string, clientId: string): Promise<boolean>;
  getSessionClients(sessionId: string): Promise<IClient[]>;
  
  // Workout Session methods
  getClientWorkoutSessions(clientId: string): Promise<IWorkoutSession[]>;
  createWorkoutSession(data: Partial<IWorkoutSession>): Promise<IWorkoutSession>;
  getWorkoutSessionStats(clientId: string): Promise<any>;
  
  // Achievement methods
  getClientAchievements(clientId: string): Promise<IAchievement[]>;
  createAchievement(data: Partial<IAchievement>): Promise<IAchievement>;
  
  // Progress Tracking - Weight methods
  getClientWeightHistory(clientId: string): Promise<any[]>;
  createWeightEntry(clientId: string, weight: number, date: string): Promise<any>;
  getClientWeightGoal(clientId: string): Promise<number | null>;
  setClientWeightGoal(clientId: string, goalWeight: number): Promise<any>;
  
  // Progress Tracking - Body Measurements methods
  getClientBodyMeasurementsHistory(clientId: string): Promise<any[]>;
  createBodyMeasurement(clientId: string, measurements: any, date: string): Promise<any>;
  
  // Progress Tracking - Personal Records methods
  getClientPersonalRecords(clientId: string): Promise<any[]>;
  createPersonalRecord(clientId: string, category: string, value: number, date: string): Promise<any>;
  
  // Progress Tracking - Weekly Completion methods
  getClientWeeklyCompletion(clientId: string): Promise<any>;
  getWeeklyCompletionHistory(clientId: string): Promise<any[]>;
  
  // Goal methods
  getClientGoals(clientId: string): Promise<IGoal[]>;
  getGoal(id: string): Promise<IGoal | null>;
  createGoal(data: Partial<IGoal>): Promise<IGoal>;
  updateGoal(id: string, data: Partial<IGoal>): Promise<IGoal | null>;
  deleteGoal(id: string): Promise<boolean>;
  updateGoalProgress(goalId: string, currentValue: number): Promise<IGoal | null>;
}

export class MongoStorage implements IStorage {
  async connect() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  }

  // Package methods
  async getAllPackages(): Promise<IPackage[]> {
    return await Package.find();
  }

  async getPackage(id: string): Promise<IPackage | null> {
    return await Package.findById(id);
  }

  async createPackage(data: Partial<IPackage>): Promise<IPackage> {
    const pkg = new Package(data);
    return await pkg.save();
  }

  async updatePackage(id: string, data: Partial<IPackage>): Promise<IPackage | null> {
    return await Package.findByIdAndUpdate(id, data, { new: true });
  }

  // Client methods
  async getAllClients(): Promise<IClient[]> {
    return await Client.find().populate('packageId');
  }

  async getClient(id: string): Promise<IClient | null> {
    return await Client.findById(id).populate('packageId');
  }

  async getClientByPhone(phone: string): Promise<IClient | null> {
    return await Client.findOne({ phone }).populate('packageId');
  }

  async createClient(data: Partial<IClient>): Promise<IClient> {
    const client = new Client(data);
    return await client.save();
  }

  async updateClient(id: string, data: Partial<IClient>): Promise<IClient | null> {
    return await Client.findByIdAndUpdate(id, data, { new: true }).populate('packageId');
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await Client.findByIdAndDelete(id);
    return !!result;
  }

  // Body Metrics methods
  async getClientBodyMetrics(clientId: string): Promise<IBodyMetrics[]> {
    return await BodyMetrics.find({ clientId }).sort({ recordedAt: -1 });
  }

  async createBodyMetrics(data: Partial<IBodyMetrics>): Promise<IBodyMetrics> {
    const metrics = new BodyMetrics(data);
    return await metrics.save();
  }

  async getLatestBodyMetrics(clientId: string): Promise<IBodyMetrics | null> {
    return await BodyMetrics.findOne({ clientId }).sort({ recordedAt: -1 });
  }

  // Video methods
  async getAllVideos(): Promise<IVideo[]> {
    return await Video.find().populate('packageRequirement');
  }

  async getVideo(id: string): Promise<IVideo | null> {
    return await Video.findById(id).populate('packageRequirement');
  }

  async createVideo(data: Partial<IVideo>): Promise<IVideo> {
    const video = new Video(data);
    return await video.save();
  }

  async updateVideo(id: string, data: Partial<IVideo>): Promise<IVideo | null> {
    return await Video.findByIdAndUpdate(id, data, { new: true }).populate('packageRequirement');
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await Video.findByIdAndDelete(id);
    return !!result;
  }

  async getVideosByPackage(packageId: string): Promise<IVideo[]> {
    return await Video.find({ packageRequirement: packageId });
  }

  // Client Video methods
  async getClientVideos(clientId: string): Promise<IVideo[]> {
    const clientVideos = await ClientVideo.find({ clientId }).populate('videoId');
    return clientVideos.map(cv => cv.videoId as any);
  }

  async assignVideoToClient(clientId: string, videoId: string): Promise<IClientVideo> {
    const clientVideo = new ClientVideo({ clientId, videoId });
    return await clientVideo.save();
  }

  async removeVideoFromClient(clientId: string, videoId: string): Promise<boolean> {
    const result = await ClientVideo.findOneAndDelete({ clientId, videoId });
    return !!result;
  }

  async searchVideos(filters: {
    category?: string;
    duration?: { min?: number; max?: number };
    intensity?: string;
    trainer?: string;
    search?: string;
  }): Promise<IVideo[]> {
    const query: any = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.intensity) {
      query.intensity = filters.intensity;
    }
    
    if (filters.trainer) {
      query.trainer = filters.trainer;
    }
    
    if (filters.duration) {
      query.duration = {};
      if (filters.duration.min !== undefined) {
        query.duration.$gte = filters.duration.min;
      }
      if (filters.duration.max !== undefined) {
        query.duration.$lte = filters.duration.max;
      }
    }
    
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    return await Video.find(query).populate('packageRequirement').sort({ createdAt: -1 });
  }

  // Video Progress methods
  async getVideoProgress(clientId: string, videoId: string): Promise<IVideoProgress | null> {
    return await VideoProgress.findOne({ clientId, videoId });
  }

  async updateVideoProgress(
    clientId: string,
    videoId: string,
    watchedDuration: number,
    totalDuration: number
  ): Promise<IVideoProgress> {
    const completed = watchedDuration >= totalDuration * 0.9;
    
    const progress = await VideoProgress.findOneAndUpdate(
      { clientId, videoId },
      {
        watchedDuration,
        totalDuration,
        lastWatchedAt: new Date(),
        completed,
      },
      { upsert: true, new: true }
    );
    
    return progress;
  }

  async getContinueWatching(clientId: string): Promise<any[]> {
    const progressList = await VideoProgress.find({
      clientId,
      completed: false,
      watchedDuration: { $gt: 0 },
    })
      .populate('videoId')
      .sort({ lastWatchedAt: -1 })
      .limit(10);
    
    return progressList.map(p => ({
      video: p.videoId,
      watchedDuration: p.watchedDuration,
      totalDuration: p.totalDuration,
      lastWatchedAt: p.lastWatchedAt,
      progressPercent: Math.round((p.watchedDuration / p.totalDuration) * 100),
    }));
  }

  // Video Bookmark methods
  async getVideoBookmarks(clientId: string): Promise<any[]> {
    const bookmarks = await VideoBookmark.find({ clientId })
      .populate('videoId')
      .sort({ bookmarkedAt: -1 });
    
    return bookmarks.map(b => ({
      ...b.toObject(),
      video: b.videoId,
    }));
  }

  async createVideoBookmark(clientId: string, videoId: string): Promise<IVideoBookmark> {
    const existing = await VideoBookmark.findOne({ clientId, videoId });
    if (existing) {
      return existing;
    }
    
    const bookmark = new VideoBookmark({ clientId, videoId });
    return await bookmark.save();
  }

  async deleteVideoBookmark(clientId: string, videoId: string): Promise<boolean> {
    const result = await VideoBookmark.findOneAndDelete({ clientId, videoId });
    return !!result;
  }

  async isVideoBookmarked(clientId: string, videoId: string): Promise<boolean> {
    const bookmark = await VideoBookmark.findOne({ clientId, videoId });
    return !!bookmark;
  }

  // Progress Photo methods
  async getProgressPhotos(clientId: string): Promise<IProgressPhoto[]> {
    return await ProgressPhoto.find({ clientId }).sort({ uploadedAt: -1 });
  }

  async createProgressPhoto(data: Partial<IProgressPhoto>): Promise<IProgressPhoto> {
    const photo = new ProgressPhoto(data);
    return await photo.save();
  }

  async deleteProgressPhoto(clientId: string, photoId: string): Promise<boolean> {
    const photo = await ProgressPhoto.findById(photoId);
    if (!photo || photo.clientId.toString() !== clientId) {
      return false;
    }
    const result = await ProgressPhoto.findByIdAndDelete(photoId);
    return !!result;
  }

  // Workout Plan methods
  async getClientWorkoutPlans(clientId: string): Promise<IWorkoutPlan[]> {
    return await WorkoutPlan.find({ clientId }).sort({ createdAt: -1 });
  }

  async getWorkoutPlan(id: string): Promise<IWorkoutPlan | null> {
    return await WorkoutPlan.findById(id);
  }

  async createWorkoutPlan(data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan> {
    const plan = new WorkoutPlan(data);
    return await plan.save();
  }

  async updateWorkoutPlan(id: string, data: Partial<IWorkoutPlan>): Promise<IWorkoutPlan | null> {
    data.updatedAt = new Date();
    return await WorkoutPlan.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteWorkoutPlan(id: string): Promise<boolean> {
    const result = await WorkoutPlan.findByIdAndDelete(id);
    return !!result;
  }

  // Diet Plan methods
  async getClientDietPlans(clientId: string): Promise<IDietPlan[]> {
    return await DietPlan.find({ clientId }).sort({ createdAt: -1 });
  }

  async getDietPlan(id: string): Promise<IDietPlan | null> {
    return await DietPlan.findById(id);
  }

  async createDietPlan(data: Partial<IDietPlan>): Promise<IDietPlan> {
    const plan = new DietPlan(data);
    return await plan.save();
  }

  async updateDietPlan(id: string, data: Partial<IDietPlan>): Promise<IDietPlan | null> {
    data.updatedAt = new Date();
    return await DietPlan.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteDietPlan(id: string): Promise<boolean> {
    const result = await DietPlan.findByIdAndDelete(id);
    return !!result;
  }

  // Live Session methods
  async getAllSessions(): Promise<ILiveSession[]> {
    return await LiveSession.find().sort({ scheduledAt: 1 });
  }

  async getSession(id: string): Promise<ILiveSession | null> {
    return await LiveSession.findById(id);
  }

  async createSession(data: Partial<ILiveSession>): Promise<ILiveSession> {
    const session = new LiveSession(data);
    return await session.save();
  }

  async updateSession(id: string, data: Partial<ILiveSession>): Promise<ILiveSession | null> {
    return await LiveSession.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await LiveSession.findByIdAndDelete(id);
    return !!result;
  }

  async getClientSessions(clientId: string): Promise<ILiveSession[]> {
    const sessionClients = await SessionClient.find({ clientId }).populate('sessionId');
    return sessionClients.map(sc => sc.sessionId as any);
  }

  // Session Client methods
  async assignClientToSession(sessionId: string, clientId: string): Promise<ISessionClient> {
    const sessionClient = new SessionClient({ sessionId, clientId });
    return await sessionClient.save();
  }

  async removeClientFromSession(sessionId: string, clientId: string): Promise<boolean> {
    const result = await SessionClient.findOneAndDelete({ sessionId, clientId });
    return !!result;
  }

  async getSessionClients(sessionId: string): Promise<IClient[]> {
    const sessionClients = await SessionClient.find({ sessionId }).populate('clientId');
    return sessionClients.map(sc => sc.clientId as any);
  }

  // Workout Session methods
  async getClientWorkoutSessions(clientId: string): Promise<IWorkoutSession[]> {
    return await WorkoutSession.find({ clientId }).sort({ completedAt: -1 });
  }

  async createWorkoutSession(data: Partial<IWorkoutSession>): Promise<IWorkoutSession> {
    const session = new WorkoutSession(data);
    return await session.save();
  }

  async getWorkoutSessionStats(clientId: string): Promise<any> {
    const allSessions = await WorkoutSession.find({ clientId }).sort({ completedAt: -1 });
    const sessions = allSessions;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const totalSessions = sessions.length;
    const weekSessions = sessions.filter(s => s.completedAt >= weekAgo).length;
    const monthSessions = sessions.filter(s => s.completedAt >= monthAgo).length;
    
    const totalCalories = sessions.reduce((sum, s) => sum + s.caloriesBurned, 0);
    const weekCalories = sessions.filter(s => s.completedAt >= weekAgo).reduce((sum, s) => sum + s.caloriesBurned, 0);
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    const sortedSessions = [...sessions].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.completedAt.getFullYear(), session.completedAt.getMonth(), session.completedAt.getDate());
      
      if (lastDate) {
        const dayDiff = Math.floor((sessionDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (dayDiff === 0) {
          continue;
        } else if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = sessionDate;
    }
    
    maxStreak = Math.max(maxStreak, tempStreak);
    
    if (lastDate) {
      const daysSinceLastWorkout = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      currentStreak = daysSinceLastWorkout <= 1 ? tempStreak : 0;
    }
    
    return {
      totalSessions,
      weekSessions,
      monthSessions,
      totalCalories,
      weekCalories,
      currentStreak,
      maxStreak,
      recentSessions: sessions.slice(0, 10),
      allSessions: sessions,
    };
  }

  // Achievement methods
  async getClientAchievements(clientId: string): Promise<IAchievement[]> {
    return await Achievement.find({ clientId }).sort({ unlockedAt: -1 });
  }

  async createAchievement(data: Partial<IAchievement>): Promise<IAchievement> {
    const achievement = new Achievement(data);
    return await achievement.save();
  }
  
  // Progress Tracking - Weight methods (in-memory storage for demo)
  private weightData = new Map<string, { entries: any[]; goal: number | null }>();
  
  async getClientWeightHistory(clientId: string): Promise<any[]> {
    const data = this.weightData.get(clientId);
    return data?.entries || [];
  }
  
  async createWeightEntry(clientId: string, weight: number, date: string): Promise<any> {
    const data = this.weightData.get(clientId) || { entries: [], goal: null };
    const entry = { weight, date };
    data.entries.unshift(entry);
    this.weightData.set(clientId, data);
    return entry;
  }
  
  async getClientWeightGoal(clientId: string): Promise<number | null> {
    const data = this.weightData.get(clientId);
    return data?.goal || null;
  }
  
  async setClientWeightGoal(clientId: string, goalWeight: number): Promise<any> {
    const data = this.weightData.get(clientId) || { entries: [], goal: null };
    data.goal = goalWeight;
    this.weightData.set(clientId, data);
    return { goal: goalWeight };
  }
  
  // Progress Tracking - Body Measurements methods (in-memory)
  private measurementsData = new Map<string, any[]>();
  
  async getClientBodyMeasurementsHistory(clientId: string): Promise<any[]> {
    return this.measurementsData.get(clientId) || [];
  }
  
  async createBodyMeasurement(clientId: string, measurements: any, date: string): Promise<any> {
    const history = this.measurementsData.get(clientId) || [];
    const entry = { ...measurements, date };
    history.unshift(entry);
    this.measurementsData.set(clientId, history);
    return entry;
  }
  
  // Progress Tracking - Personal Records methods (in-memory)
  private personalRecordsData = new Map<string, any[]>();
  
  async getClientPersonalRecords(clientId: string): Promise<any[]> {
    return this.personalRecordsData.get(clientId) || [];
  }
  
  async createPersonalRecord(clientId: string, category: string, value: number, date: string): Promise<any> {
    const records = this.personalRecordsData.get(clientId) || [];
    const record = { category, value, date };
    records.unshift(record);
    this.personalRecordsData.set(clientId, records);
    return record;
  }
  
  // Progress Tracking - Weekly Completion methods (in-memory)
  async getClientWeeklyCompletion(clientId: string): Promise<any> {
    const sessions = await this.getClientWorkoutSessions(clientId);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const completedThisWeek = sessions.filter((s: any) => new Date(s.date) >= startOfWeek);
    
    return {
      completedWorkouts: completedThisWeek.length,
      plannedWorkouts: 5,
      completedDays: completedThisWeek.map((s: any) => s.date),
      average: Math.round(sessions.length / 4),
    };
  }
  
  async getWeeklyCompletionHistory(clientId: string): Promise<any[]> {
    const sessions = await this.getClientWorkoutSessions(clientId);
    const weeks: any[] = [];
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekSessions = sessions.filter((s: any) => {
        const date = new Date(s.date);
        return date >= weekStart && date <= weekEnd;
      });
      
      weeks.push({
        startDate: weekStart.toISOString(),
        completed: weekSessions.length,
        planned: 5,
      });
    }
    
    return weeks;
  }
  
  // Goal methods
  async getClientGoals(clientId: string): Promise<IGoal[]> {
    return await Goal.find({ clientId, status: { $ne: 'abandoned' } }).sort({ createdAt: -1 });
  }
  
  async getGoal(id: string): Promise<IGoal | null> {
    return await Goal.findById(id);
  }
  
  async createGoal(data: Partial<IGoal>): Promise<IGoal> {
    const goal = new Goal(data);
    return await goal.save();
  }
  
  async updateGoal(id: string, data: Partial<IGoal>): Promise<IGoal | null> {
    data.updatedAt = new Date();
    return await Goal.findByIdAndUpdate(id, data, { new: true });
  }
  
  async deleteGoal(id: string): Promise<boolean> {
    const result = await Goal.findByIdAndDelete(id);
    return !!result;
  }
  
  async updateGoalProgress(goalId: string, currentValue: number): Promise<IGoal | null> {
    const goal = await Goal.findById(goalId);
    if (!goal) return null;
    
    const progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
    const updatedMilestones = goal.milestones.map(milestone => {
      if (!milestone.achieved && currentValue >= milestone.value) {
        return {
          value: milestone.value,
          label: milestone.label,
          achieved: true,
          achievedAt: new Date(),
        };
      }
      return milestone;
    });
    
    const status = progress >= 100 ? 'completed' : 'active';
    
    return await Goal.findByIdAndUpdate(
      goalId,
      {
        currentValue,
        progress,
        status,
        milestones: updatedMilestones,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }
}

export const storage = new MongoStorage();
