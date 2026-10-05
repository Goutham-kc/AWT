import React, { useState } from 'react';

export const StudentTrust = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  const listings = [
    {
      title: 'Sony A7III + 24-70mm Lens',
      description:
        'Perfect for event photography or high-quality video projects. Includes 2 batteries and SD card.',
      price: '₹45',
      period: 'Per Day',
      campus: 'Main Campus',
      category: 'Electronics',
      color: 'blue',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8shdtWJqhG1T1suamF5sjhPaGM5BZaChbw2AnGL_Xik47nr28IPOMjjY9H2V97uvGUnHtZvtigkYmsrxhB8SlBwJJY--1W6cVWCyW65UideVOKILX3d4JoHvz7XjIClNeSrdQ2apfFwM5bpZH-KB49st8voHomq-xq_cgc1eotlqr2k3P2_V35bj_SKfaYiVSAV46raXszphnd3uVRkItvZZsftFdw7uPlOQ-4EvhFjCetgU2mdmBgQ',
    },
    {
      title: 'REI Half Dome 2 Plus Tent',
      description:
        'Spacious 2-person tent, easy to set up. Great for weekend trips to Yosemite or Big Sur.',
      price: '₹25',
      period: 'Per Weekend',
      campus: 'West Dorms',
      category: 'Outdoors',
      color: 'green',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCks0nrH4Auyl2Q1upt4_dDeUzg6HOjgCSrUAqty_uqGeYWwAlkQZ7MhWp4Gppvxb9BPKsb9cFjmpii5bKFitRmxHayZiOjWCT3Rymi3z1xZwobkZUBh7tRgyzlD_st4tvFW7vqpx2r5-UKOvrYhTPXOh54UgNJMgog-kCa9RaQmRnGRO_KIudyyMNhVw4PevjKZjE070OXHt72aIBbVOsLzB0E1VAvwOfdPCPzyFgIjnjtyVyWvpQQrA',
    },
    {
      title: 'Sony WH-1000XM4',
      description:
        'Industry leading noise canceling headphones. Essential for deep study sessions during finals week.',
      price: '₹15',
      period: 'Per Day',
      campus: 'Main Campus',
      category: 'Electronics',
      color: 'blue',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAGAtxZBGKMYfL7XfYJjH4-4qavHA80xpYuZRAPy5fQFylKdTr3WqrVZ815n2f9vCIPYb8Vz24JaKbFavFJbYXMybTsYBdon_NlCOJL33OIA8CtbmXo2UhZDg49eZpcQZgW5rYt0WuPhUZrxderHHSOUPgW-MgrLlDTbPynihMnu8vKTT0ZNsEAFH4a1RWfe3pUGocbRIKZkwTrh4TkkHKaoJ-5L19FEVEzSWR3sqYMzBCnjBuCe7WuvA',
    },
    {
      title: 'Specialized Allez Road Bike',
      description:
        'Lightweight road bike, great for commuting across campus or weekend rides. Includes U-lock.',
      price: '₹35',
      period: 'Per Week',
      campus: 'South Campus',
      category: 'Transportation',
      color: 'yellow',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDV5Ha_G9SPYFFn_U8gY3e9POl4sm55bd0NDZ6mPRFBPE_KQotS_-4MSpZvjDQq66jHw6-4T9A-ZT9sL1KHsYATE2YlD09Co5h5ZXRiwL6e6PpjzoogKCwWLQ_3Kso-IqEzY7JdTZb9Q0YyFDGRUcAhkVL4BNLgl4ZiWRTKpComO3qjUAS9O1NvxIeXCzlcvN6A7lK4FxpPTkoTeMUdTaKp0ooorlif6-ZfaXfuVBb_yFWJ9mdET3RpRg',
    },
  ];

  const colorClasses = {
    blue: {
      badge: 'bg-blue-50 border-blue-100',
      dot: 'bg-blue-500',
      title: 'group-hover:text-blue-600',
    },
    green: {
      badge: 'bg-green-50 border-green-100',
      dot: 'bg-green-500',
      title: 'group-hover:text-green-600',
    },
    yellow: {
      badge: 'bg-yellow-50 border-yellow-100',
      dot: 'bg-yellow-500',
      title: 'group-hover:text-yellow-600',
    },
  };

  return (
    <main className="flex-grow bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Profile Header */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-60 bg-gradient-to-r from-blue-800 to-blue-500">
            <div className="absolute inset-0 bg-blue-700/10" />
          </div>

          <div className="px-6 md:px-10 pb-8">
            <div className="relative -mt-20 flex flex-col md:flex-row gap-6 items-start">

              <div className="relative shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW-s0b8xAXX-AFbavebV_6NwMlWUzURTnk6GOroecA3zSSmcE5Q6dn-ldWnM8_5cxQfirVRj01wRCBGWraY_MeYkBALJEDJoESE1sE81ja-mMUYy1ByEB3_IXABfnd5wzGFC6pHIgxSMpYpagg-kACA03GW4dqXjiAMDKWgpadDbBqhOgJ0dNCEQChRrSNUPQ0WFCCRLqkOxOjSh349BNZmSUpsKFnN51gPM33-oeEQueqauPFilYB"
                  alt="Alex Mercer"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-8 border-white shadow-md"
                />

                <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center border-4 border-white shadow-md">
                  ✓
                </div>
              </div>

              <div className="flex-grow pt-4 w-full">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                      Alex Mercer
                    </h1>

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Stanford University
                      </span>

                      <span className="text-slate-500 text-sm">
                        Member since Aug 2022
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => showMessage('User reported')}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium"
                    >
                      Report User
                    </button>

                    <button
                      onClick={() => showMessage('Message window opened')}
                      className="px-6 py-2 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800"
                    >
                      Message
                    </button>
                  </div>
                </div>

                <p className="mt-5 max-w-3xl text-slate-600 leading-7">
                  Computer Science major, avid photographer, and outdoor
                  enthusiast. Always happy to lend out my camera gear and
                  camping equipment to fellow students. Let's make campus life
                  more sustainable through sharing!
                </p>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <p className="text-3xl font-bold text-blue-700">
                      4 <span className="text-lg">years+</span>
                    </p>
                    <p className="text-xs text-blue-700/70 uppercase tracking-wide mt-1">
                      Experience
                    </p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                    <p className="text-3xl font-bold text-amber-600">
                      4.9 ⭐
                    </p>
                    <p className="text-xs text-amber-700/70 uppercase tracking-wide mt-1">
                      128 Reviews
                    </p>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 text-center">
                    <p className="text-3xl font-bold text-teal-700">98%</p>
                    <p className="text-xs text-teal-700/70 uppercase tracking-wide mt-1">
                      Response Rate
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                    <p className="text-3xl font-bold text-green-600">✓</p>
                    <p className="text-xs text-green-700/70 uppercase tracking-wide mt-1">
                      ID Verified
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="border-b border-slate-200 flex gap-3 overflow-x-auto pb-2">

            <button
              onClick={() => setActiveTab('listings')}
              className={`font-semibold py-2 px-4 rounded-full whitespace-nowrap ${
                activeTab === 'listings'
                  ? 'bg-blue-800 text-white'
                  : 'text-slate-500 hover:text-blue-800'
              }`}
            >
              Active Listings (4)
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`font-semibold py-2 px-4 rounded-full whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'bg-blue-800 text-white'
                  : 'text-slate-500 hover:text-blue-800'
              }`}
            >
              Reviews (128)
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`font-semibold py-2 px-4 rounded-full whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-blue-800 text-white'
                  : 'text-slate-500 hover:text-blue-800'
              }`}
            >
              About
            </button>

          </div>

          {/* Listings */}
          {activeTab === 'listings' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">

              {listings.map((item) => {
                const colors = colorClasses[item.color];

                return (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group border border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div
                        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-bold border ${colors.badge}`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${colors.dot} mr-2`}
                        />
                        {item.category}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3
                        className={`text-lg font-semibold line-clamp-2 ${colors.title}`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-auto pt-4 flex justify-between items-end border-t border-slate-200">
                        <div>
                          <span className="block text-xs text-slate-500 uppercase tracking-wide">
                            {item.period}
                          </span>

                          <span className="text-2xl font-bold">
                            {item.price}
                          </span>
                        </div>

                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                          {item.campus}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="py-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div className="text-5xl mb-4">⭐</div>
                <h2 className="text-2xl font-bold">Reviews</h2>
                <p className="text-slate-500 mt-2">
                  This user has received 128 reviews with an average rating of
                  4.9 stars.
                </p>
              </div>
            </div>
          )}

          {/* About */}
          {activeTab === 'about' && (
            <div className="py-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <h2 className="text-2xl font-bold mb-4">About Alex Mercer</h2>

                <p className="text-slate-600 leading-7">
                  Alex is a Computer Science major at Stanford University who
                  enjoys photography, outdoor activities, and helping fellow
                  students access useful equipment through sharing.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500">University</p>
                    <p className="font-semibold mt-1">Stanford University</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Member Since</p>
                    <p className="font-semibold mt-1">August 2022</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Verification</p>
                    <p className="font-semibold text-green-600 mt-1">
                      ID Verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Toast */}
      {message && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg">
          {message}
        </div>
      )}
    </main>
  );
};

export default StudentTrust;