import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isMenuOpen: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isMenuOpen: false,
  theme: 'light'
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    }
  }
});

export const { toggleMenu, setTheme } = uiSlice.actions;
export default uiSlice.reducer; 