import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { apiMessage } from "../../app/api";

export const createOrder = createAsyncThunk("payments/order", async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post("/payments/order", payload); return data.data; }
  catch (error) { return rejectWithValue(apiMessage(error)); }
});
export const verifyPayment = createAsyncThunk("payments/verify", async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post("/payments/verify", payload); return data; }
  catch (error) { return rejectWithValue(apiMessage(error)); }
});
const slice = createSlice({ name: "payments", initialState: { status: "idle", error: null, success: false }, reducers: { resetPayment: (state) => { state.status = "idle"; state.error = null; state.success = false; } }, extraReducers: (builder) => {
  builder.addCase(createOrder.pending, (state) => { state.status = "loading"; state.error = null; })
    .addCase(createOrder.fulfilled, (state) => { state.status = "ready"; })
    .addCase(createOrder.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; })
    .addCase(verifyPayment.fulfilled, (state) => { state.status = "succeeded"; state.success = true; })
    .addCase(verifyPayment.rejected, (state, action) => { state.status = "failed"; state.error = action.payload; });
} });
export const { resetPayment } = slice.actions;
export default slice.reducer;
