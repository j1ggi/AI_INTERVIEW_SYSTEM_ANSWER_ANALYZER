import mongoose from 'mongoose';

const monitoringEventSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'no_face_detected',
        'person_out_of_frame',
        'multiple_faces_detected',
        'head_turned_away',
        'looking_off_screen',
        'eye_gaze_deviated',
        'tab_switched',
        'window_blurred',
        'fullscreen_exit',
        'keyboard_shortcut_violation',
        'audio_anomaly_detected',
        'camera_disconnected',
        'proctoring_violation',
        'max_warnings_exceeded'
      ],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.85,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying events by interview
monitoringEventSchema.index({ interviewId: 1, timestamp: 1 });

const MonitoringEvent = mongoose.model('MonitoringEvent', monitoringEventSchema);
export default MonitoringEvent;
