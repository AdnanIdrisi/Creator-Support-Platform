import { useEffect, useState } from "react";
import { Check, Coffee, Heart, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchLeaderboard, fetchPublicCreator } from "../../features/creator/creatorSlice";
import { createOrder, resetPayment, verifyPayment } from "../../features/payments/paymentSlice";
import { Avatar, Button, Field, Spinner, Textarea } from "../../components/ui";
import ErrorBanner from "../../components/ErrorBanner";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CreatorPage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { publicPage, leaderboard, status, error } = useSelector((state) => state.creator);
  const payment = useSelector((state) => state.payments);
  const [form, setForm] = useState({ supporterName: "", supporterEmail: "", message: "", coffees: 1 });

  useEffect(() => {
    dispatch(fetchPublicCreator(username));
    dispatch(fetchLeaderboard(username));
    return () => dispatch(resetPayment());
  }, [dispatch, username]);

  if (error) return <div className="flex min-h-screen items-center justify-center p-6 text-center"><div><div className="font-display text-4xl font-extrabold text-navy">Oops.</div><p className="mt-3 text-muted">{error}</p></div></div>;
  if (status === "loading" || !publicPage) return <div className="min-h-screen bg-[#f7faff]"><Spinner /></div>;

  const { creator, stats, recentSupports } = publicPage;
  const amount = creator.coffeePrice * Number(form.coffees);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const pay = async (event) => {
    event.preventDefault();
    if (!await loadRazorpay()) return;
    const result = await dispatch(createOrder({ username, ...form, coffees: Number(form.coffees) }));
    if (!createOrder.fulfilled.match(result)) return;
    const order = result.payload;
    const checkout = new window.Razorpay({
      key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
      name: `Pourly for ${creator.name}`, description: `${form.coffees} coffee${form.coffees > 1 ? "s" : ""} for ${creator.name}`,
      prefill: { name: form.supporterName, email: form.supporterEmail }, theme: { color: "#153B6D" },
      handler: async (response) => {
        await dispatch(verifyPayment(response));
        dispatch(fetchPublicCreator(username));
        dispatch(fetchLeaderboard(username));
        setForm({ supporterName: "", supporterEmail: "", message: "", coffees: 1 });
      },
    });
    checkout.open();
  };

  return <div className="min-h-screen bg-[#f7faff] pb-16">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8"><div className="flex items-center gap-2 font-display text-xl font-extrabold text-ink"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white"><Coffee size={18} /></span>pourly<span className="text-navy">.</span></div><div className="flex items-center gap-2 text-xs font-semibold text-muted"><ShieldCheck size={15} className="text-navy" /> Secure checkout</div></header>
    <main className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-navy px-6 py-10 text-white shadow-soft sm:px-12 sm:py-14"><div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[45px] border-white/10" /><div className="relative max-w-2xl"><div className="mb-6 flex items-center gap-4"><Avatar name={creator.name} src={creator.avatarUrl} size="lg" /><div><div className="text-sm font-semibold text-blue-200">Creator page</div><div className="font-display text-xl font-extrabold">{creator.name}</div><div className="text-sm text-blue-100">@{creator.username}</div></div></div><h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">Keep {creator.name}'s<br /><span className="text-[#9bc8ff]">work going.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-blue-100">{creator.bio || "A small coffee can make a big difference. Send some support and a note to this creator."}</p><div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-blue-100"><span className="rounded-full bg-white/10 px-4 py-2">{stats.totalCoffees} coffees received</span><span className="rounded-full bg-white/10 px-4 py-2">{stats.supporterCount} supporters</span></div></div></section>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft"><div className="mb-6"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-navy"><Sparkles size={15} /> Send support</div><h2 className="font-display text-2xl font-extrabold">Buy {creator.name} a coffee</h2><p className="mt-2 text-sm text-muted">No account needed. Just your name, a kind note, and a little boost.</p></div><ErrorBanner>{payment.error}</ErrorBanner>{payment.success ? <div className="rounded-2xl bg-[#e9f8f0] p-6 text-center text-[#177245]"><Check className="mx-auto" /><div className="mt-3 font-display text-xl font-extrabold">Thanks for the coffee!</div><p className="mt-1 text-sm">Your support is on its way to {creator.name}.</p></div> : <form onSubmit={pay} className="space-y-4"><div><div className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-muted">Choose coffees</div><div className="grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((number) => <button type="button" key={number} onClick={() => setForm({ ...form, coffees: number })} className={`rounded-xl border py-3 text-sm font-bold transition ${Number(form.coffees) === number ? "border-navy bg-navy text-white" : "border-line bg-white text-muted hover:border-navy"}`}>{number} ☕</button>)}</div></div><div className="rounded-xl bg-sky px-4 py-3 text-sm text-navy">{form.coffees} coffee{form.coffees > 1 ? "s" : ""} · <strong>₹{amount}</strong></div><Field label="Your name" name="supporterName" placeholder="Riya" value={form.supporterName} onChange={change} required /><Field label="Email address" type="email" name="supporterEmail" placeholder="riya@example.com" value={form.supporterEmail} onChange={change} required /><Textarea label="Leave a note (optional)" name="message" rows="3" maxLength="200" placeholder="Your Redis video finally made it click!" value={form.message} onChange={change} /><Button loading={payment.status === "loading"} className="w-full"><Coffee size={17} />Pay ₹{amount} securely</Button><div className="text-center text-xs text-muted">Payments are processed securely by Razorpay.</div></form>}</section>
        <div className="space-y-7"><section className="rounded-2xl border border-line bg-white p-6 shadow-soft"><div className="flex items-center gap-2"><Users size={19} className="text-navy" /><h2 className="font-display text-lg font-extrabold">Top supporters</h2></div><div className="mt-5 space-y-4">{leaderboard.map((person, index) => <div className="flex items-center gap-3" key={`${person.name}-${index}`}><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky text-sm font-bold text-navy">{index + 1}</div><div className="flex-1 text-sm font-bold">{person.name}</div><div className="text-sm font-bold text-navy">{person.coffees} ☕</div></div>)}{!leaderboard.length && <p className="text-sm text-muted">Be the first supporter.</p>}</div></section><section className="rounded-2xl border border-line bg-white p-6 shadow-soft"><div className="flex items-center gap-2"><MessageCircle size={19} className="text-navy" /><h2 className="font-display text-lg font-extrabold">Recent notes</h2></div><div className="mt-5 space-y-4">{recentSupports.map((support) => <div className="border-l-2 border-sky pl-4" key={`${support.supporterName}-${support.paidAt}`}><div className="text-sm font-bold">{support.supporterName} <span className="font-normal text-muted">sent {support.coffees} ☕</span></div>{support.message && <div className="mt-1 text-sm leading-6 text-muted">“{support.message}”</div>}</div>)}{!recentSupports.length && <p className="text-sm text-muted">Messages from supporters will appear here.</p>}</div></section></div>
      </div>
    </main>
    <footer className="mx-auto mt-10 flex max-w-6xl items-center justify-center gap-2 px-5 text-xs text-muted"><Heart size={13} className="text-navy" /> Made for creators who keep showing up.</footer>
  </div>;
}
