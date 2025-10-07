import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    isEventNotification: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;