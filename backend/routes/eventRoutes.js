import express from "express";
import Events from "../models/Events.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Message from "../models/Message.js";

const router = express.Router();

// ✅ Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Events.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ✅ Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// ✅ Create new event and send notifications
router.post("/", async (req, res) => {
  try {
    // 1️⃣ Save the new event
    const newEvent = new Events(req.body);
    const savedEvent = await newEvent.save();

    // 2️⃣ Fetch all teachers and students
    const teachers = await Teacher.find({});
    const students = await Student.find({});

    // 3️⃣ Build notification message
    const content = `📢 New event added: ${savedEvent.title}\n${savedEvent.description || ""}`;

    // 4️⃣ Prepare notification messages for all users
    const notifications = [];

    // For teachers
    for (const teacher of teachers) {
      notifications.push(
        new Message({
          senderId: "admin",
          senderName: "Admin",
          receiverId: teacher._id,
          content,
          eventId: savedEvent._id,
          isEventNotification: true,
          isRead: false,
          timestamp: new Date(),
        })
      );
    }

    // For students
    for (const student of students) {
      notifications.push(
        new Message({
          senderId: "admin",
          senderName: "Admin",
          receiverId: student._id,
          content,
          eventId: savedEvent._id,
          isEventNotification: true,
          isRead: false,
          timestamp: new Date(),
        })
      );
    }

    // 5️⃣ Save all messages at once if any
    if (notifications.length > 0) {
      await Message.insertMany(notifications);
    }

    // 6️⃣ Respond with confirmation
    res.status(201).json({
      message: "✅ Event created and notifications sent successfully",
      event: savedEvent,
      totalNotifications: notifications.length,
    });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(400).json({
      error: "Failed to create event",
      details: err.message,
    });
  }
});

// ✅ Update event
router.put("/:id", async (req, res) => {
  try {
    const updatedEvent = await Events.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });
    res.json(updatedEvent);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to update event", details: err.message });
  }
});

// ✅ Delete event
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Events.findByIdAndDelete(req.params.id);
    if (!deletedEvent)
      return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
