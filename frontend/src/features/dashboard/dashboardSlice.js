import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { apiMessage } from "../../app/api";

export const fetchDashboard = createAsyncThunk("dashboard/fetch", async (options = {}, { rejectWithValue }) => {
  try {
    const { days = 30, supporterLimit = 5, supportsPage = 1, supportsLimit = 8 } = options;
    const [summary, earnings, topSupporters, supports] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get(`/dashboard/earnings?days=${days}`),
      api.get(`/dashboard/top-supporters?limit=${supporterLimit}`),
      api.get(`/dashboard/supports?page=${supportsPage}&limit=${supportsLimit}`),
    ]);
    return {
      summary: summary.data.data,
      earnings: earnings.data.data,
      topSupporters: topSupporters.data.data.data,
      supports: supports.data.data,
    };
  } catch (error) { return rejectWithValue(apiMessage(error)); }
});
const slice = createSlice({ name: "dashboard", initialState: { data: null, status: "idle", error: null }, reducers: {}, extraReducers: (builder) => {
  builder.addCase(fetchDashboard.pending, (state) => { state.status = "loading"; state.error = null; })
    .addCase(fetchDashboard.fulfilled, (state, action) => { state.data = action.payload; state.status = "succeeded"; })
    .addCase(fetchDashboard.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; });
} });
export default slice.reducer;
