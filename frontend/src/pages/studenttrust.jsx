import React from 'react';
import { Link } from 'react-router-dom';

export const StudentTrust = () => {
  return (
    <main className="flex-grow bg-slate-50 text-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <span className="material-symbols-outlined text-base">verified</span>
            Campus Safety & Peer Verification
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Built on Student Trust
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Academica Exchange is an exclusive peer-to-peer sharing network restricted exclusively to verified students of TKM College of Engineering. Here is how we keep every rental safe and fair.
          </p>
        </section>

        {/* 4 Pillars of Campus Trust */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">mark_email_read</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Institutional Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every member must verify with an active <code>@tkmce.ac.in</code> institutional email and OTP. Anonymous or outside accounts are strictly blocked.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Security Deposit Escrow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Listers set a fair refundable security deposit on valuable gear (cameras, scientific calculators, bikes) which protects against damage or delayed returns.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pin_drop</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">Designated Campus Zones</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exchanges take place exclusively on campus: Central Library, College Canteen, Mech Block, or Main Gate for maximum security and ease of coordination.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">forum</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900">In-App Chat Logs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All communications, rental dates, and handover confirmations are tracked within our encrypted chat thread to prevent misunderstandings.
            </p>
          </div>
        </section>

        {/* Recommended Safe Meetup Zones */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Recommended Campus Safe Zones</h2>
            <p className="text-sm text-slate-500 mt-1">
              For your safety and convenience, always schedule gear handoffs and returns at well-lit, public locations across campus:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Spot 1</span>
                <h4 className="font-bold text-slate-900 mt-1">Central Library Lobby</h4>
                <p className="text-xs text-slate-500 mt-2">Quiet, staffed, equipped with security cameras. Perfect for book and calculator handoffs.</p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-green-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> High Safety Rating
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Spot 2</span>
                <h4 className="font-bold text-slate-900 mt-1">College Canteen</h4>
                <p className="text-xs text-slate-500 mt-2">High foot traffic during daytime and breaks. Convenient for quick gear inspections over snacks.</p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-green-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> High Safety Rating
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Spot 3</span>
                <h4 className="font-bold text-slate-900 mt-1">Mechanical Block Portico</h4>
                <p className="text-xs text-slate-500 mt-2">Spacious, open-air area ideal for inspecting bicycles, engineering instruments, and sports gear.</p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-green-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> High Safety Rating
              </span>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Spot 4</span>
                <h4 className="font-bold text-slate-900 mt-1">Main Gate Security Post</h4>
                <p className="text-xs text-slate-500 mt-2">Located right at the campus entrance with security personnel present at all times.</p>
              </div>
              <span className="mt-4 text-[11px] font-semibold text-green-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span> High Safety Rating
              </span>
            </div>
          </div>
        </section>

        {/* Guidelines & FAQ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Best Practices */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rule</span>
              Student Code of Conduct
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-green-600 text-base mt-0.5">check</span>
                <span><strong>Inspect items on pickup:</strong> Renter and lister should test electronic items and inspect item condition together before confirming pickup.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-green-600 text-base mt-0.5">check</span>
                <span><strong>Respect agreed dates:</strong> Returns must occur on or before the rental end date to avoid holding up the next classmate in line.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-green-600 text-base mt-0.5">check</span>
                <span><strong>Treat gear with care:</strong> Return items clean and in the same state received. Treat other students' gear better than your own.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-green-600 text-base mt-0.5">check</span>
                <span><strong>Keep communication inside the app:</strong> In-app messaging guarantees transparency and timestamps should any question arise.</span>
              </li>
            </ul>
          </div>

          {/* Quick FAQ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">help</span>
              Trust & Safety FAQ
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-bold text-slate-900">What if someone does not return an item?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Because every user is verified via their <code>@tkmce.ac.in</code> college email and registered roll details, community accountability is preserved and campus administrators can be notified if required.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900">How do security deposits work?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Security deposits are calculated during checkout and held safely until the item is returned in proper condition.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900">Can I report an issue or user?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Yes, you can notify campus moderators directly or message support from your profile settings.
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* CTA Strip */}
        <section className="bg-primary text-white rounded-2xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-2xl font-bold">Ready to start sharing on campus?</h3>
            <p className="text-xs text-white/80 mt-1">Explore available gear or list your own textbooks, cycles, and equipment.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/marketplace"
              className="px-6 py-3 bg-white text-primary text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3 border border-white/40 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors"
            >
              My Profile
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
};

export default StudentTrust;