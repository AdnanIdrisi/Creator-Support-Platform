import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { apiMessage, setAccessToken } from "../../app/api";

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      setAccessToken(data.data.accessToken);
      return data.data;
    } catch (error) {
      return rejectWithValue(apiMessage(error));
    }
  },
);
export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      setAccessToken(data.data.accessToken);
      return data.data;
    } catch (error) {
      return rejectWithValue(apiMessage(error));
    }
  },
);
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.data.user;
    } catch (error) {
      setAccessToken(null);
      return rejectWithValue(apiMessage(error));
    }
  },
);
export const logout = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
  setAccessToken(null);
});

const slice = createSlice({
  name: "auth",
  initialState: { user: null, status: "idle", error: null, initialized: false },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = "idle";
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addMatcher(
        (action) =>
          [register.pending.type, login.pending.type].includes(action.type),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          [register.fulfilled.type, login.fulfilled.type].includes(action.type),
        (state, action) => {
          state.user = action.payload.user;
          state.status = "succeeded";
          state.initialized = true;
        },
      )
      .addMatcher(
        (action) =>
          [register.rejected.type, login.rejected.type].includes(action.type),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        },
      );
  },
});
export const { clearError } = slice.actions;
export default slice.reducer;
