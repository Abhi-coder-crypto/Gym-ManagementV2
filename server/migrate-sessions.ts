import mongoose from 'mongoose';
import { LiveSession } from './models';

export async function migrateLiveSessionReferences() {
  try {
    console.log('🔄 Starting LiveSession schema migration...');
    
    // Find all sessions
    const sessions = await LiveSession.find({});
    let migratedCount = 0;
    
    for (const session of sessions) {
      let needsUpdate = false;
      const updates: any = {};
      
      // Convert trainerId from string to ObjectId if needed
      if (session.trainerId && typeof session.trainerId === 'string' && session.trainerId.length === 24) {
        try {
          updates.trainerId = new mongoose.Types.ObjectId(session.trainerId);
          needsUpdate = true;
        } catch (e) {
          console.log(`⚠️  Could not convert trainerId for session ${session._id}`);
        }
      }
      
      // Convert packageId from string to ObjectId if needed
      if (session.packageId && typeof session.packageId === 'string' && session.packageId.length === 24) {
        try {
          updates.packageId = new mongoose.Types.ObjectId(session.packageId as string);
          needsUpdate = true;
        } catch (e) {
          console.log(`⚠️  Could not convert packageId for session ${session._id}`);
        }
      }
      
      // Initialize clients array if it doesn't exist
      if (!session.clients || !Array.isArray(session.clients)) {
        updates.clients = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await LiveSession.findByIdAndUpdate(session._id, updates);
        migratedCount++;
      }
    }
    
    console.log(`✅ LiveSession migration complete. Updated ${migratedCount} of ${sessions.length} sessions.`);
  } catch (error: any) {
    console.error('❌ LiveSession migration failed:', error.message);
  }
}
