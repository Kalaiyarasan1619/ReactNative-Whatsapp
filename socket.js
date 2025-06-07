import conversation from "./modules/conversation.js";
import Message from "./modules/Message.js";

export default function socketHandler(io) {
  console.log("Socket.io server is running");

  io.on("connection", (socket) => {
    const userId =
      socket.handshake.auth.userId || socket.handshake.query.userId;

    console.log(`User connected: ${socket.id}`);

    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    }

    socket.on("join", (otherUserId) => {
      socket.join(otherUserId);
      console.log(`User ${userId} is ${otherUserId} joined a chat`);
    });

    socket.on("send-message", async (data) => {
      const { otherUserId, text } = data;

      try {
        let conversation_data = await conversation.findOne({
          participants: { $all: [userId, otherUserId] },
        }).populate("participants");

        let isNew = false;

        if (!conversation_data) {

          isNew = true;

          conversation_data = new conversation({
            participants: [userId, otherUserId],
          });

          await conversation_data.populate("participants");

        }

        const message=new Message({
          conversationId: conversation_data._id,
          senderId: userId,
          text
        })

        await message.save();

        const unreadCount = conversation_data.unreadCount.get(otherUserId.toString()) || 0;
        conversation_data.unreadCount.set(otherUserId.toString(), unreadCount + 1);

        conversation_data.lastmessage = message;

        await conversation_data.save();
        socket.to(otherUserId).emit("receive-message", {
          text, conversation_data, isNew
        });
      } catch (error) {
        console.error("Error sending message:", error);
        return;
      }

      // console.log(message, "SENT");
    });

    socket.on("focus-conversation", async (conversationId) => {

      try{

        const conversation_unread = await conversation.findById(conversationId);

        if (!conversation_unread) {
          console.error("Conversation not found:", conversationId);
          return;
        }

        conversation_unread.unreadCount.set(userId, 0);
        await conversation_unread.save();

      }catch (error) {
        console.error("Error focusing conversation:", error);
      }

    })

  });
}
