'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdFlightTakeoff } from 'react-icons/md';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FormElementsPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitted, setSubmitted] = useState(false); // for red border validation

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Dynamic input class for validation red border
  const getInputClass = (field: string) =>
    `w-full bg-white text-gray-900 border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 ${
      submitted && !formData[field as keyof typeof formData]
        ? 'border-red-400 focus:ring-red-400'
        : 'border-gray-300 focus:ring-[#004051]'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setMessage(null);

    // Validate required fields
    const requiredFields = [
      'regn', 'fltNo', 'typeOfFlight', 'from', 'to', 'landings',
      'offBlock', 'onBlock', 'prevHrs', 'takeOff', 'landing',
      'flightTime', 'takeOffDate', 'landingDate', 'totalHrs',
      'employeeNo', 'captName'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (emptyFields.length > 0) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return; // stop submission
    }

    try {
      const res = await fetch(`${API_BASE}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Flight saved successfully!', type: 'success' });

        // Reset form
        setFormData({
          regn: '', fltNo: '', typeOfFlight: '', from: '', to: '',
          landings: '', offBlock: '', onBlock: '', prevHrs: '', takeOff: '',
          landing: '', flightTime: '', takeOffDate: '', landingDate: '',
          totalHrs: '', employeeNo: '', captName: '', acftRelease: false,
        });
        setSubmitted(false);

        // Redirect after 1.5s
        setTimeout(() => router.push('/flights'), 1500);
      } else {
        setMessage({ text: data.error || 'Failed to save flight', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save flight', type: 'error' });
    }
  };

  const labelClass = 'text-[15px] font-semibold text-gray-700 mb-1 block';

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
          <MdFlightTakeoff className="h-5 w-5 text-white" /> Create New Flight
        </h2>
        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm flex items-center gap-1 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 gap-6 bg-white">
        {/* Inline Message */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-base font-semibold text-white shadow-lg flex items-center gap-2
              transition-all duration-300 ease-in-out
              ${message.type === 'success' ? 'bg-[#06b6d4]' : 'bg-red-700'}
            `}
          >
            {message.text}
          </div>
        )}

        {/* Row Group 1 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="regn" className={labelClass}>REGN</label>
            <select id="regn" value={formData.regn} onChange={handleChange} className={getInputClass('regn')}>
              <option value="">Choose Regn</option>
              <option value="Regn # 1">Regn # 1</option>
              <option value="Regn # 2">Regn # 2</option>
            </select>
          </div>
          <div>
            <label htmlFor="fltNo" className={labelClass}>FLT No</label>
            <select id="fltNo" value={formData.fltNo} onChange={handleChange} className={getInputClass('fltNo')}>
              <option value="">Choose Flight No</option>
              <option value="A-00001">A-00001</option>
              <option value="A-00002">A-00002</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeOfFlight" className={labelClass}>Type of Flight</label>
            <select id="typeOfFlight" value={formData.typeOfFlight} onChange={handleChange} className={getInputClass('typeOfFlight')}>
              <option value="">Choose Type</option>
              <option value="Commercial">Commercial</option>
              <option value="Non-Commercial">Non-Commercial</option>
            </select>
          </div>
        </div>

        {/* Row Group 2 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="from" className={labelClass}>From</label>
            <select id="from" value={formData.from} onChange={handleChange} className={getInputClass('from')}>
              <option value="">Choose Airport</option>
              <option value="DXB">DXB</option>
              <option value="NYC">NYC</option>
              <option value="KCA">KCA</option>
            </select>
          </div>
          <div>
            <label htmlFor="to" className={labelClass}>To</label>
            <select id="to" value={formData.to} onChange={handleChange} className={getInputClass('to')}>
              <option value="">Choose Airport</option>
              <option value="DXB">DXB</option>
              <option value="NYC">NYC</option>
              <option value="KCA">KCA</option>
            </select>
          </div>
          <div>
            <label htmlFor="landings" className={labelClass}>Number Of Landing</label>
            <input id="landings" type="text" value={formData.landings} onChange={handleChange} placeholder="(L/P/LI)" className={getInputClass('landings')} />
          </div>
        </div>

        {/* Row Group 3 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offBlock" className={labelClass}>Off Block</label>
            <input id="offBlock" type="time" value={formData.offBlock} onChange={handleChange} className={getInputClass('offBlock')} />
          </div>
          <div>
            <label htmlFor="onBlock" className={labelClass}>On Block</label>
            <input id="onBlock" type="time" value={formData.onBlock} onChange={handleChange} className={getInputClass('onBlock')} />
          </div>
          <div>
            <label htmlFor="prevHrs" className={labelClass}>Previous HRS</label>
            <input id="prevHrs" type="time" value={formData.prevHrs} onChange={handleChange} className={getInputClass('prevHrs')} />
          </div>
        </div>

        {/* Row Group 4 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOff" className={labelClass}>Take Off</label>
            <input id="takeOff" type="time" value={formData.takeOff} onChange={handleChange} className={getInputClass('takeOff')} />
          </div>
          <div>
            <label htmlFor="landing" className={labelClass}>Landing</label>
            <input id="landing" type="time" value={formData.landing} onChange={handleChange} className={getInputClass('landing')} />
          </div>
          <div>
            <label htmlFor="flightTime" className={labelClass}>Flight Time</label>
            <input id="flightTime" type="time" value={formData.flightTime} onChange={handleChange} className={getInputClass('flightTime')} />
          </div>
        </div>

        {/* Row Group 5 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOffDate" className={labelClass}>Take Off Date</label>
            <input id="takeOffDate" type="date" value={formData.takeOffDate} onChange={handleChange} className={getInputClass('takeOffDate')} />
          </div>
          <div>
            <label htmlFor="landingDate" className={labelClass}>Landing Date</label>
            <input id="landingDate" type="date" value={formData.landingDate} onChange={handleChange} className={getInputClass('landingDate')} />
          </div>
          <div>
            <label htmlFor="totalHrs" className={labelClass}>Total ACFT HRS</label>
            <input id="totalHrs" type="time" value={formData.totalHrs} onChange={handleChange} className={getInputClass('totalHrs')} />
          </div>
        </div>

        {/* Row Group 6 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="employeeNo" className={labelClass}>Employee No</label>
            <input id="employeeNo" type="text" value={formData.employeeNo} onChange={handleChange} placeholder="Employee No" className={getInputClass('employeeNo')} />
          </div>
          <div>
            <label htmlFor="captName" className={labelClass}>Capt Name</label>
            <input id="captName" type="text" value={formData.captName} onChange={handleChange} placeholder="Capt Name" className={getInputClass('captName')} />
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

        {/* Footer Submit */}
        <div className="flex justify-end border-t pt-4">
          <button
            type="submit"
            className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition flex items-center gap-1"
          >
            Submit Flight
          </button>
        </div>
      </form>
    </div>
  );
}
