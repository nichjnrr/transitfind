// src/app/(dashboard)/report-found/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const CATEGORIES = ['WALLET','PHONE','KEYS','BAG','CLOTHING','ELECTRONICS','DOCUMENTS','JEWELLERY','UMBRELLA','OTHER'];
const TRANSPORT_MODES = ['MRT','BUS','LRT','INTERCHANGE'];

export default function ReportFoundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    transportMode: '',
    location: '',
    dateTimeFound: '',
    contactEmail: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.description.trim().length < 10) {
        toast.error("Description must be at least 10 characters");
        setLoading(false);
    return;
    }

    try {
      const res = await fetch('/api/found-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Found item reported successfully!');
        router.push('/dashboard');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Something went wrong');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Report a Found Item</h1>
      <p className="page-subtitle">Help reunite someone with their lost belongings.</p>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-group">
          <label htmlFor="title">Item Title</label>
          <input id="title" name="title" type="text" placeholder="e.g. Blue umbrella" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" placeholder="Describe the item in detail..." value={form.description} 
                onChange={(e) => {
                    handleChange(e);
                    setCharCount(e.target.value.length);
                }} required rows={4} />
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>
                {charCount} / 500 characters
            </p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transportMode">Transport Mode</label>
            <select id="transportMode" name="transportMode" value={form.transportMode} onChange={handleChange} required>
              <option value="">Select mode</option>
              {TRANSPORT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location Found</label>
          <input id="location" name="location" type="text" placeholder="e.g. Tampines MRT, Bus 65" value={form.location} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="dateTimeFound">Date & Time Found</label>
          <input id="dateTimeFound" name="dateTimeFound" type="datetime-local" value={form.dateTimeFound} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Your Contact Email</label>
          <input id="contactEmail" name="contactEmail" type="email" placeholder="owner can reach you at this email" value={form.contactEmail} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn-primary" 
            disabled={
                loading ||
                !form.title ||
                !form.description ||
                !form.category ||
                !form.transportMode ||
                !form.location ||
                !form.dateTimeOfLoss ||
                !form.contactEmail
             }
        >
          {loading ? 'Submitting...' : 'Submit Found Item'}
        </button>
      </form>
    </div>
  );
}