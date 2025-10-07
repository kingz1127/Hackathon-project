import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// ✅ UNIFIED: Send a message (teacher → student or student → teacher OR admin → event notification)
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, senderName, receiverId, content, eventId, isEventNotification } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create and save message in Message collection
    const message = new Message({ 
      senderId, 
      senderName, 
      receiverId, 
      content,
      eventId: eventId || null,
      isEventNotification: isEventNotification || false,
      timestamp: new Date(),
      isRead: false
    });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all messages between teacher & student (for chat history)
router.get("/messages/chat/:teacherId/:studentId", async (req, res) => {
  try {
    const { teacherId, studentId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: teacherId, receiverId: studentId },
        { senderId: studentId, receiverId: teacherId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Get all messages received by a student (student notifications)
router.get("/messages/student/:studentId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.studentId })
      .populate('eventId')
      .sort({ timestamp: -1 }); // latest first

    res.json(messages);
  } catch (err) {
    console.error("Error fetching student messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all messages received by a teacher (teacher notifications)
router.get("/messages/teacher/:teacherId", async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.params.teacherId })
      .populate('eventId')
      .sort({ timestamp: -1 }); // latest first

    res.json(messages);
  } catch (err) {
    console.error("Error fetching teacher messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mark a message as read
router.patch("/messages/read/:id", async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a message
router.delete("/messages/:id", async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Real-time notification stream using Server-Sent Events (SSE)
router.get("/messages/stream/:receiverId", async (req, res) => {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
  });
  res.flushHeaders();

  console.log(`🔔 SSE connected for user: ${req.params.receiverId}`);

  // Function to fetch and send notifications
  const sendUpdate = async () => {
    try {
      const messages = await Message.find({ receiverId: req.params.receiverId })
        .sort({ timestamp: -1 })
        .limit(50);
      res.write(`data: ${JSON.stringify(messages)}\n\n`);
    } catch (err) {
      console.error("SSE send error:", err);
    }
  };

  // Send immediately once connected
  await sendUpdate();

  // Poll DB every 5 seconds for updates
  const interval = setInterval(sendUpdate, 5000);

  req.on("close", () => {
    console.log(`❌ SSE disconnected for user: ${req.params.receiverId}`);
    clearInterval(interval);
  });
});

export default router;
