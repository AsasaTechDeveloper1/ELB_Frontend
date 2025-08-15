'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormElementsPage() {
  const router = useRouter();

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ docName, docType, file, description });
  };

  const inputClass =
    'w-full bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004051]';
  const labelClass = 'text-[15px] font-semibold text-gray-700 mb-1 block';

  return (
    <div className="max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-[#004051] px-6 py-3 flex justify-between items-center">
        <h2 className="text-white text-lg font-semibold">🧾 Create New Flight</h2>
        <button
          onClick={() => router.back()}
          type="button"
          className="text-white text-sm hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 gap-6 bg-white">
        {/* Row Group 1 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="regn" className={labelClass}>REGN</label>
            <select id="regn" className={inputClass}>
              <option>Choose Regn</option>
              <option>Regn # 1</option>
              <option>Regn # 2</option>
            </select>
          </div>
          <div>
            <label htmlFor="fltNo" className={labelClass}>FLT No</label>
            <select id="fltNo" className={inputClass}>
              <option>Choose Flight No</option>
              <option>A-00001</option>
              <option>A-00002</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeOfFlight" className={labelClass}>Type of Flight</label>
            <select id="typeOfFlight" className={inputClass}>
              <option>Choose Type</option>
              <option>Commercial</option>
              <option>Non-Commercial</option>
            </select>
          </div>
        </div>

        {/* Row Group 2 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="from" className={labelClass}>From</label>
            <select id="from" className={inputClass}>
              <option>Choose Airport</option>
              <option>DXB</option>
              <option>NYC</option>
              <option>KCA</option>
            </select>
          </div>
          <div>
            <label htmlFor="to" className={labelClass}>To</label>
            <select id="to" className={inputClass}>
              <option>Choose Airport</option>
              <option>DXB</option>
              <option>NYC</option>
              <option>KCA</option>
            </select>
          </div>
          <div>
            <label htmlFor="landings" className={labelClass}>Number Of Landing</label>
            <input id="landings" type="text" placeholder="(L/P/LI)" className={inputClass} />
          </div>
        </div>

        {/* Row Group 3 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offBlock" className={labelClass}>Off Block</label>
            <input id="offBlock" type="time" className={inputClass} />
          </div>
          <div>
            <label htmlFor="onBlock" className={labelClass}>On Block</label>
            <input id="onBlock" type="time" className={inputClass} />
          </div>
          <div>
            <label htmlFor="prevHrs" className={labelClass}>Previous HRS</label>
            <input id="prevHrs" type="time" className={inputClass} />
          </div>
        </div>

        {/* Row Group 4 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOff" className={labelClass}>Take Off</label>
            <input id="takeOff" type="time" className={inputClass} />
          </div>
          <div>
            <label htmlFor="landing" className={labelClass}>Landing</label>
            <input id="landing" type="time" className={inputClass} />
          </div>
          <div>
            <label htmlFor="flightTime" className={labelClass}>Flight Time</label>
            <input id="flightTime" type="time" className={inputClass} />
          </div>
        </div>

        {/* Row Group 5 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="takeOffDate" className={labelClass}>Take Off Date</label>
            <input id="takeOffDate" type="date" className={inputClass} />
          </div>
          <div>
            <label htmlFor="landingDate" className={labelClass}>Landing Date</label>
            <input id="landingDate" type="date" className={inputClass} />
          </div>
          <div>
            <label htmlFor="totalHrs" className={labelClass}>Total ACFT HRS</label>
            <input id="totalHrs" type="time" className={inputClass} />
          </div>
        </div>

        {/* Row Group 6 */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="employeeNo" className={labelClass}>Employee No</label>
            <input id="employeeNo" type="text" placeholder="Employee No" className={inputClass} />
          </div>
          <div>
            <label htmlFor="captName" className={labelClass}>Capt Name</label>
            <input id="captName" type="text" placeholder="Capt Name" className={inputClass} />
          </div>
          <div className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              id="acftRelease"
              className="h-4 w-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#004051]"
            />
            <label htmlFor="acftRelease" className="text-sm font-medium text-gray-700">ACFT RELEASE</label>
          </div>
        </div>

        {/* Footer Submit */}
        <div className="flex justify-end border-t pt-4">
          <button
            type="submit"
            className="bg-[#004051] hover:bg-[#00363f] text-white text-sm font-medium px-6 py-2 rounded-md transition"
          >
            Submit Flight
          </button>
        </div>
      </form>
    </div>
  );
}
