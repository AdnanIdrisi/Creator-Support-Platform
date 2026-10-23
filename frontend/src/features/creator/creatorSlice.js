import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { apiMessage } from "../../app/api";

export const updateCreator = createAsyncThunk("creator/update", async (payload, { rejectWithValue }) => {
  try { const { data } = await api.patch("/creators/me", payload); return data.data.user; }
  catch (error) { return rejectWithValue(apiMessage(error)); }
});
export const fetchPublicCreator = createAsyncThunk("creator/public", async (username, { rejectWithValue }) => {
  try { const { data } = await api.get(`/creators/${username}`); return data.data; }
  catch (error) { return rejectWithValue(apiMessage(error)); }
});
export const fetchLeaderboard = createAsyncThunk("creator/leaderboard", async (username, { rejectWithValue }) => {
  try { const { data } = await api.get(`/creators/${username}/leaderboard`); return data.data; }
  catch (error) { return rejectWithValue(apiMessage(error)); }
});
const slice = createSlice({ name: "creator", initialState: { publicPage: null, leaderboard: [], status: "idle", error: null }, reducers: {}, extraReducers: (builder) => {
  builder.addCase(updateCreator.fulfilled, (state) => { state.status = "succeeded"; })
    .addCase(fetchPublicCreator.pending, (state) => { state.status = "loading"; state.error = null; })
    .addCase(fetchPublicCreator.fulfilled, (state, action) => { state.publicPage = action.payload; state.status = "succeeded"; })
    .addCase(fetchPublicCreator.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
    .addCase(fetchLeaderboard.fulfilled, (state, action) => { state.leaderboard = action.payload; });
} });
export default slice.reducer;
