import { createSlice, combineReducers } from '@reduxjs/toolkit';

const chatMessagesSlice = createSlice({
  name: 'chatMessages',
  initialState: [],
  reducers: {
    setChatMessages: (state, action) => action.payload,
    appendChatMessage: (state, action) => {
      state.push(action.payload);
    },
    clearChatMessages: () => []
  },
});

export const { setChatMessages, appendChatMessage, clearChatMessages } = chatMessagesSlice.actions;

const rootReducer = combineReducers({
  chatMessages: chatMessagesSlice.reducer,
});

export default rootReducer;
