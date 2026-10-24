import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CreateListing() {
  const { token, setIsLoginOpen } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'textbooks',
    condition: 'Good',
    pricePerDay: '',
    deposit: '',
    imageUrl: '',
    location: '',
    campus: '',
    paymentMethod: 'UPI',
    paymentDetails: '',
    allowDirectBooking: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-xl border border-outline-variant shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
        <p className="text-on-surface-variant mb-4">You need to log in to create a listing.</p>
        <button onClick={() => setIsLoginOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90">
          Log In
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          pricePerDay: Number(formData.pricePerDay),
          deposit: Number(formData.deposit)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create listing');
      }

      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-on-surface mb-6">Create a Listing</h1>
        
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-on-surface mb-1">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="What are you renting out?"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-on-surface mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
                placeholder="Provide details about the item..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-on-surface mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
                >
                  <option value="textbooks">Textbooks</option>
                  <option value="electronics">Electronics</option>
                  <option value="cycles">Cycles</option>
                  <option value="furniture">Furniture</option>
                  <option value="utilities">Utilities</option>
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-on-surface mb-1">Condition</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
                >
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Well Used">Well Used</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-on-surface mb-1">Price per Day (₹)</label>
                <input
                  type="number"
                  id="pricePerDay"
                  name="pricePerDay"
                  required
                  min="0"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="deposit" className="block text-sm font-medium text-on-surface mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  id="deposit"
                  name="deposit"
                  required
                  min="0"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Payment & Payout Option Placeholder */}
            <div className="p-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-low/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                  <h3 className="text-sm font-bold text-on-surface">Payment / Payout Option</h3>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Gateway Placeholder
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Choose how you prefer to accept rental payments and refundable security deposits from borrowers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paymentMethod" className="block text-xs font-semibold text-on-surface mb-1">
                    Accepted Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white text-sm"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Cash on Handoff">Cash on Handoff / Meetup</option>
                    <option value="Campus Escrow">Academica Escrow / In-App Credits</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentDetails" className="block text-xs font-semibold text-on-surface mb-1">
                    {formData.paymentMethod === 'UPI'
                      ? 'UPI ID / VPA'
                      : formData.paymentMethod === 'Bank Transfer'
                      ? 'Bank Account & IFSC Info'
                      : formData.paymentMethod === 'Campus Escrow'
                      ? 'Campus Student ID'
                      : 'Handoff Payment Instructions'}
                  </label>
                  <input
                    type="text"
                    id="paymentDetails"
                    name="paymentDetails"
                    value={formData.paymentDetails}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white text-sm"
                    placeholder={
                      formData.paymentMethod === 'UPI'
                        ? 'e.g. yourname@okhdfcbank or 9876543210@upi'
                        : formData.paymentMethod === 'Bank Transfer'
                        ? 'e.g. A/C No: 1234567890, IFSC: SBIN0001234'
                        : formData.paymentMethod === 'Campus Escrow'
                        ? 'e.g. STU-2024-8842 (or linked automatically)'
                        : 'e.g. Exact cash upon item pickup at campus center'
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-base">lock</span>
                <span>
                  <strong>Secure Gateway Placeholder:</strong> Real-time payment processing (Razorpay, UPI Intent, or Student Escrow) will integrate directly here in future updates.
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-on-surface mb-1">Image URL (Optional)</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-on-surface mb-1">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="e.g. Block A, Room 101"
                />
              </div>

              <div>
                <label htmlFor="campus" className="block text-sm font-medium text-on-surface mb-1">Campus</label>
                <input
                  type="text"
                  id="campus"
                  name="campus"
                  required
                  value={formData.campus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  placeholder="e.g. Main Campus"
                />
              </div>
            </div>

            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="allowDirectBooking"
                name="allowDirectBooking"
                checked={formData.allowDirectBooking}
                onChange={handleChange}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label htmlFor="allowDirectBooking" className="ml-2 block text-sm text-on-surface">
                Allow direct booking (skip manual approval)
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/50">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
