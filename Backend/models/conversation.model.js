import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Links this conversation to a specific user
  },
  userMessage: {
    type: String,
    required: true,
  },
  sathiResponse: {
    type: String,
    required: true,
  },
  emotion: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;