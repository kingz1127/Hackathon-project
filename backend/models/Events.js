import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // optional, remove `required: true` if you want
    date: { type: Date, required: true },
    location: { type: String },
    organizer: { type: String },
    participants: [{ type: String }], // array of participant names/emailscd h
  },
  { timestamps: true } // auto add createdAt & updatedAt
);

// Auto-creates "events" collection when first saved
const Event = mongoose.model("Event", eventSchema);

export default Event;
