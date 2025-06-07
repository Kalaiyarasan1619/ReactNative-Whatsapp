import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    validate: [
      (arr) => arr.length >= 2,
      "At least two participants are required",
    ],
    required: true,
  },
  lastmessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
});


export default mongoose.model("Conversation", conversationSchema);