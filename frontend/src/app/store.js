import { configureStore } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import dashboard from "../features/dashboard/dashboardSlice";
import creator from "../features/creator/creatorSlice";
import payments from "../features/payments/paymentSlice";

export const store = configureStore({ reducer: { auth, dashboard, creator, payments } });
