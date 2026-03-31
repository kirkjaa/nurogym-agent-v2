export const setChatMessages = (messages) => ({
  type: 'chatMessages/setChatMessages',
  payload: messages,
});

export const appendChatMessage = (message) => ({
  type: 'chatMessages/appendChatMessage',
  payload: message,
});

export const clearChatMessages = () => ({
  type: 'chatMessages/clearChatMessages',
});
