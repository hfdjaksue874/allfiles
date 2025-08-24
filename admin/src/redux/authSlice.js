
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
  },
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
    },
    checkAuthStatus: (state) => {
      const token = localStorage.getItem('token');
      state.isLoggedIn = !!token;
    },
  },
});

export const { login, logout, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;
