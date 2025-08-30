'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MdFlightTakeoff, MdEdit } from 'react-icons/md';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FlightFormPage() {
  const router = useRouter();
  const params = useParams();
  const flightId = params?.id as string | undefined;

  const [loading, setLoading] = useState(!!flightId);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    regn: '',
    fltNo: '',
    typeOfFlight: '',
    from: '',
    to: '',
    landings: '',
    offBlock: '',
    onBlock: '',
    prevHrs: '',
    takeOff: '',
    landing: '',
    flightTime: '',
    takeOffDate: '',
    landingDate: '',
    totalHrs: '',
    employeeNo: '',
    captName: '',
    acftRelease: false,
  });

  // Load existing flight if editing
  useEffect(() => {
    if (!flightId) return;

    async function fetchFlight() {
      try {
        const res = await fetch(`${API_BASE}/flights/${flightId}`);
        if (!res.ok) throw new Error('Failed to fetch flight');

        const data = await res.json();

        // Map API fields to formData keys
        setFormData({
          regn: data.regn || '',
          fltNo: data.fltNo || '',
          typeOfFlight: data.typeOfFlight || '',
          from: data.from || '',
          to: data.to || '',
          landings: data.landings || '',
          offBlock: data.offBlock || '',
          onBlock: data.onBlock || '',
          prevHrs: data.prevHrs || '',
          takeOff: data.takeOff || '',
          landing: data.landing || '',
          flightTime: data.flightTime || '',
          takeOffDate: data.takeOffDate || '',
          landingDate: data.landingDate || '',
          totalHrs: data.totalHrs || '',
          employeeNo: data.employeeNo || '',
          captName: data.captName || '',
          acftRelease: Boolean(data.acftRelease),
        });

      } catch (err) {
        console.error(err);
        setMessage({ text: '❌ Failed to load flight', type: 'error' });
      } finally {
        setLoading(false);
      }
    }

    fetchFlight();
  }, [flightId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const requiredFields: (keyof typeof formData)[] = [
      'regn', 'fltNo', 'typeOfFlight', 'from', 'to', 'employeeNo', 'captName'
    ];
    return requiredFields.every(field => {
      const value = formData[field];
      return typeof value === 'string' && value.trim() !== '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage(null);

    if (!validate()) {
      setMessage({ text: '❌ Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      const method = flightId ? 'PUT' : 'POST';
      const url = flightId ? `${API_BASE}/flights/${flightId}` : `${API_BASE}/flights`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: flightId ? 'Flight updated!' : 'Flight created!', type: 'success' });
        setTimeout(() => router.push('/flights'), 1500);
      } else {
        setMessage({ text: ' Error: ' + (data.error || 'Unknown error'), type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save flight', type: 'error' });
    }
  };

  const inputClass =
    'w-full bg-white text-gray-900 border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]';
  const labelClass = 'text-[15px] font-semibold text-gray-700 mb-1 block';
  const getInputStyle = (field: string) =>
    `${inputClass} ${submitted && !formData[field as keyof typeof formData] ? 'border-red-500' : 'border-gray-300'}`;

  if (loading) return <p className="text-gray-600 p-6">Loading flight details...</p>;

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          {flightId ? <MdEdit className="h-5 w-5" /> : <MdFlightTakeoff className="h-5 w-5" />}
          {flightId ? 'Edit Flight' : 'Create New Flight'}
        </h2>
        <button onClick={() => router.back()} type="button" className="text-white text-sm hover:underline">
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 gap-6 bg-white">

        
      {message && (
        <div
          className={`md:col-span-2 mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg transition-all duration-300 ${
            message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

        {/* Row 1 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="regn" className={labelClass}>REGN *</label>
            <select id="regn" value={formData.regn} onChange={handleChange} className={getInputStyle('regn')}>
              <option value="">Choose Regn</option>
              <option value="Regn # 1">Regn # 1</option>
              <option value="Regn # 2">Regn # 2</option>
            </select>
          </div>
          <div>
            <label htmlFor="fltNo" className={labelClass}>FLT No *</label>
            <select id="fltNo" value={formData.fltNo} onChange={handleChange} className={getInputStyle('fltNo')}>
              <option value="">Choose Flight No</option>
              <option value="A-00001">A-00001</option>
              <option value="A-00002">A-00002</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeOfFlight" className={labelClass}>Type of Flight *</label>
            <select id="typeOfFlight" value={formData.typeOfFlight} onChange={handleChange} className={getInputStyle('typeOfFlight')}>
              <option value="">Choose Type</option>
              <option value="Commercial">Commercial</option>
              <option value="Non-Commercial">Non-Commercial</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="from" className={labelClass}>From *</label>
            <select id="from" value={formData.from} onChange={handleChange} className={getInputStyle('from')}>
              <option value="">Choose Airport</option>
              <option value="DXB">DXB</option>
              <option value="NYC">NYC</option>
              <option value="KCA">KCA</option>
            </select>
          </div>
          <div>
            <label htmlFor="to" className={labelClass}>To *</label>
            <select id="to" value={formData.to} onChange={handleChange} className={getInputStyle('to')}>
              <option value="">Choose Airport</option>
              <option value="DXB">DXB</option>
              <option value="NYC">NYC</option>
              <option value="KCA">KCA</option>
            </select>
          </div>
          <div>
            <label htmlFor="employeeNo" className={labelClass}>Employee No *</label>
            <input id="employeeNo" type="text" value={formData.employeeNo} onChange={handleChange} placeholder="Employee No" className={getInputStyle('employeeNo')} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="captName" className={labelClass}>Capt Name *</label>
            <input id="captName" type="text" value={formData.captName} onChange={handleChange} placeholder="Capt Name" className={getInputStyle('captName')} />
          </div>
          <div>
            <label htmlFor="landings" className={labelClass}>Number Of Landing</label>
            <input id="landings" type="text" value={formData.landings} onChange={handleChange} placeholder="(L/P/LI)" className={inputClass} />
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              id="acftRelease"
              checked={formData.acftRelease}
              onChange={handleChange}
              className="h-4 w-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
            />
            <label htmlFor="acftRelease" className="text-sm font-medium text-gray-700">ACFT RELEASE</label>
          </div>
        </div>

        {/* Row 4 (Times) */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offBlock" className={labelClass}>Off Block</label>
            <input id="offBlock" type="time" value={formData.offBlock} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="onBlock" className={labelClass}>On Block</label>
            <input id="onBlock" type="time" value={formData.onBlock} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="prevHrs" className={labelClass}>Previous HRS</label>
            <input id="prevHrs" type="time" value={formData.prevHrs} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Row 5 (Flight Times) */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOff" className={labelClass}>Take Off</label>
            <input id="takeOff" type="time" value={formData.takeOff} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="landing" className={labelClass}>Landing</label>
            <input id="landing" type="time" value={formData.landing} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="flightTime" className={labelClass}>Flight Time</label>
            <input id="flightTime" type="time" value={formData.flightTime} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Row 6 (Dates & Total HRS) */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOffDate" className={labelClass}>Take Off Date</label>
            <input id="takeOffDate" type="date" value={formData.takeOffDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="landingDate" className={labelClass}>Landing Date</label>
            <input id="landingDate" type="date" value={formData.landingDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="totalHrs" className={labelClass}>Total HRS</label>
            <input id="totalHrs" type="time" value={formData.totalHrs} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end border-t pt-4">
          <button
            type="submit"
            className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition"
          >
            {flightId ? 'Update Flight' : 'Submit Flight'}
          </button>
        </div>
      </form>
    </div>
  );
}
