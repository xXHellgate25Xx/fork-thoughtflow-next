// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import exampleSlice from './service/example/exampleSlice';

 const store = configureStore({
  reducer: {
    example: exampleSlice, // Add your reducers here
  },
});

export default store;
