import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { isSubscribed } from '../components/SidebarProfileSection';
import { Check } from 'lucide-react';

export const About = () => {
  const subscribed = isSubscribed();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            This is the Youth Research Office newsletter.
          </h1>

          <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-10 aspect-[21/9] bg-gray-100">
            <img
              src="/Hero-section.png"
              alt="Youth Research Office"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/70 via-transparent to-transparent">
              <p className="text-white/90 text-sm mb-1">Youth Research Office</p>
              <p className="text-white text-xl font-bold">Insights for policymakers and entrepreneurs creating the future of Uzbekistan.</p>
            </div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed mb-10">
            <p>
              Youth Research Office (YRO) is a compact research unit inside the Youth Affairs Agency that turns national youth data into clear, visual, decision-ready insights.
            </p>
            <p>
              We frame one question at a time—measure it rigorously, explain it simply, and publish the result with clean visuals and transparent sources. Our focus: education, skills, employment, entrepreneurship, and social support—with a single goal: make youth progress measurable, comparable, and actionable.
            </p>
            <p>
              Through our research we deliver evidence-based insights to support policy and investment decisions. This newsletter offers a behind-the-scenes look at our methodology, as well as practical findings for policymakers and entrepreneurs building the future of Uzbekistan.
            </p>
            <p>
              If you care about youth development and evidence-based decision-making, it's time to lock in.
            </p>
          </div>

          <div className="mb-10">
            <p className="text-gray-700 mb-3">Get the Youth Research Office newsletter weekly ⚡</p>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100/80 text-gray-700 border border-gray-200/80">
                <Check size={18} className="text-gray-600 shrink-0" />
                <span className="font-medium text-sm">Subscribed</span>
              </div>
            ) : (
              <Link
                to="/subscribe"
                state={{ from: '/about' }}
                className="inline-block bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Subscribe
              </Link>
            )}
          </div>

          <p className="text-gray-600 mb-12">
            To get in contact with our team or learn more about Youth Research Office,{' '}
            <a href="mailto:contact@youthresearch.uz" className="text-accent hover:underline font-medium">
              click here
            </a>.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">People</h2>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Youth Research Office</h3>
                  <p className="text-gray-500 text-sm mt-0.5">@youthresearchoffice</p>
                  <p className="text-gray-600 text-sm mt-2">Insights for policymakers and entrepreneurs creating the future of Uzbekistan.</p>
                  <div className="flex gap-3 mt-4">
                    {subscribed ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 text-gray-700 border border-gray-200 text-sm font-medium">
                        <Check size={16} />
                        Subscribed
                      </div>
                    ) : (
                      <Link
                        to="/subscribe"
                        state={{ from: '/about' }}
                        className="inline-block bg-accent hover:bg-accent-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Subscribe
                      </Link>
                    )}
                    <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
                      Message
                    </button>
                  </div>
                </div>
                <img
                  src="/Logo.png"
                  alt="Youth Research Office"
                  className="w-16 h-16 rounded-full object-contain shrink-0 border border-gray-200"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>© 2026 Youth Research Office</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black">Privacy</a>
              <a href="#" className="hover:text-black">Terms</a>
              <a href="#" className="hover:text-black">Collection notice</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
