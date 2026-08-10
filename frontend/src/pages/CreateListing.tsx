import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CreateListing() {
  const { token } = useApp();
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
    allowDirectBooking: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-xl border border-outline-variant shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
        <p className="text-on-surface-variant mb-4">You need to log in to create a listing.</p>
        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90">
          Log In
        </button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
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
