import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import AuthLayout from "../../components/AuthLayout";
import ErrorBanner from "../../components/ErrorBanner";
import { Button, Field } from "../../components/ui";
import { clearError, login } from "../../features/auth/authSlice";

export default function Login() { const dispatch = useDispatch(); const navigate = useNavigate(); const { status, error } = useSelector((state) => state.auth); const [form, setForm] = useState({ email: "", password: "" }); const change = (e) => { dispatch(clearError()); setForm({ ...form, [e.target.name]: e.target.value }); }; const submit = async (e) => { e.preventDefault(); const result = await dispatch(login(form)); if (login.fulfilled.match(result)) navigate("/dashboard"); };
return <AuthLayout eyebrow="Welcome back" title="Your workspace is ready."><form onSubmit={submit} className="space-y-4"><ErrorBanner>{error}</ErrorBanner><Field label="Email address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={change} required /><Field label="Password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={change} required /><Button loading={status === "loading"} className="mt-3 w-full">Sign in to dashboard</Button></form><p className="mt-7 text-center text-sm text-muted">New to pourly? <Link className="font-bold text-navy hover:underline" to="/register">Create your creator account</Link></p></AuthLayout>; }
