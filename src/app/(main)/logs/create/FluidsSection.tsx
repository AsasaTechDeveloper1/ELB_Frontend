'use client';

import { useState } from 'react';

export default function FluidsSection() {
  const [engQuantities, setEngQuantities] = useState([0, 0, 0]);
  const [hydQuantities, setHydQuantities] = useState([0, 0, 0]);

  const handleEngChange = (index: number, value: number) => {
    const newQuantities = [...engQuantities];
    newQuantities[index] = value;
    setEngQuantities(newQuantities);
  };

  const incrementEng = (index: number) => {
    handleEngChange(index, engQuantities[index] + 1);
  };

  const decrementEng = (index: number) => {
    if (engQuantities[index] > 0) {
      handleEngChange(index, engQuantities[index] - 1);
    }
  };

  const handleHydChange = (index: number, value: number) => {
    const newQuantities = [...hydQuantities];
    newQuantities[index] = value;
    setHydQuantities(newQuantities);
  };

  const incrementHyd = (index: number) => {
    handleHydChange(index, hydQuantities[index] + 1);
  };

  const decrementHyd = (index: number) => {
    if (hydQuantities[index] > 0) {
      handleHydChange(index, hydQuantities[index] - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <div className="bg-white text-gray-800 p-6 rounded-xl border border-gray-200 w-full shadow-sm mb-4">
          {/* 🚀 scroll only on mobile */}
          <div className="overflow-x-auto md:overflow-visible">
            <table className="border border-gray-300 text-sm rounded overflow-hidden min-w-[600px] md:min-w-0">
              <thead>
                <tr className="bg-[#004051] text-white">
                  <th className="p-2 text-center">FUEL</th>
                  <th className="p-2 text-center">KGS</th>
                  <th className="p-2 text-center" colSpan={2}>Additional</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['A) Arrival Fuel:', 'FUEL FREEZE POINT'],
                  ['B) Fuel Used on GND:', 'SG (DENSITY) KG / LTRs'],
                  ['C) Before Uplift:', 'US GAL / LTRs'],
                ].map(([label1, label2], i) => (
                  <tr className="border" key={i}>
                    <td className="p-2 font-medium">{label1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Type here..."
                        className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      />
                    </td>
                    <td className="p-2 font-medium">{label2}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Type here..."
                        className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      />
                    </td>
                  </tr>
                ))}
                {[
                  'D) Required Uplift:',
                  'E) Actual Uplift:',
                  'F) Indicated Fob:',
                  'G) Fob Difference:',
                  'H) Difference Actual-Indicated:',
                ].map((label, index) => (
                  <tr className="border" key={index}>
                    <td className="p-2 font-medium">{label}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Type here..."
                        className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      />
                    </td>
                    <td className="p-2 font-medium"></td>
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="-"
                        className="w-[160px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="border">
                  <td className="p-2 font-medium text-[#004051]">
                    Supplier
                    <input
                      type="text"
                      placeholder="Enter supplier..."
                      className="w-[160px] md:w-full mt-1 px-2 py-1 border border-[#004051] rounded focus:ring focus:ring-[#004051]/30"
                    />
                  </td>
                  <td className="p-2 font-medium text-[#004051]">
                    Receipts
                    <input
                      type="text"
                      placeholder="Enter receipts..."
                      className="w-[160px] md:w-full mt-1 px-2 py-1 border border-[#004051] rounded focus:ring focus:ring-[#004051]/30"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white text-gray-800 p-6 rounded-xl border border-gray-200 w-full shadow-sm space-y-4">
          {/* 🚀 Scrollable only on mobile */}
          <div className="overflow-x-auto md:overflow-visible">
            <table className="border-collapse text-sm rounded border border-gray-300 min-w-[600px] md:min-w-0">
              <tbody>
                <tr className="bg-[#004051] text-white">
                  <td className="p-2 border">ENG / APU OIL</td>
                  <td className="p-2 border">ENG 1</td>
                  <td className="p-2 border">ENG 2</td>
                  <td className="p-2 border">APU</td>
                </tr>

                <tr>
                  <td className="p-2 bg-[#004051] text-white border">QTY / QTS</td>
                  {[0, 1, 2].map((i) => (
                    <td key={`eng-${i}`} className="p-2 border text-center">
                      <input
                        type="number"
                        placeholder="Type here..."
                        className="w-[140px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                        value={engQuantities[i]}
                        onChange={(e) => handleEngChange(i, Number(e.target.value))}
                        min={0}
                      />
                    </td>
                  ))}
                </tr>

                <tr className="bg-[#004051] text-white">
                  <td className="p-2 border">HYD OIL</td>
                  <td className="p-2 border">L / GREEN</td>
                  <td className="p-2 border">C / BLUE</td>
                  <td className="p-2 border">R / YELLOW</td>
                </tr>

                <tr>
                  <td className="p-2 bg-[#004051] text-white border">QTY / QTS</td>
                  {[0, 1, 2].map((i) => (
                    <td key={`hyd-${i}`} className="p-2 border text-center">
                      <input
                        type="number"
                        placeholder="Type here..."
                        className="w-[140px] md:w-full px-2 py-1 border border-gray-300 rounded focus:ring focus:ring-[#004051]/30"
                        value={hydQuantities[i]}
                        onChange={(e) => handleHydChange(i, Number(e.target.value))}
                        min={0}
                      />
                    </td>
                  ))}
                </tr>

                <tr className="bg-[#004051] text-white">
                  <td className="p-2 border">WATER QTY</td>
                  <td className="p-2 border">ARRIVAL</td>
                  <td className="p-2 border">DEPARTURE</td>
                  <td className="p-2 border"></td>
                </tr>

                <tr>
                  <td className="p-2 bg-[#004051] text-white border">%</td>
                  {[0, 1].map((i) => (
                    <td className="p-2 border" key={`water-${i}`}>
                      <input
                        type="text"
                        placeholder="Type here..."
                        className="w-[140px] md:w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                      />
                    </td>
                  ))}
                  <td className="p-2 border"></td>
                </tr>

                <tr>
                  <td className="p-2 text-center bg-[#004051] text-white border" colSpan={3}>
                    GROUND DE - ICING
                  </td>
                  <td className="p-2 text-center bg-[#004051] text-white border">Action</td>
                </tr>

                <tr>
                  <td className="p-2 bg-[#004051] text-white border">Type</td>
                  <td colSpan={2} className="p-2 border">
                    <input
                      type="text"
                      placeholder="Type here..."
                      className="w-[160px] md:w-full border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                    />
                  </td>
                  <td rowSpan={2} className="p-2 border text-center align-middle">
                    <button className="bg-[#004051] hover:bg-[#00353f] text-white text-sm font-medium py-1.5 px-6 rounded shadow transition">
                      Auth
                    </button>
                  </td>
                </tr>

                <tr>
                  <td className="p-2 bg-[#004051] text-white border">MIX & Time</td>
                  <td colSpan={2} className="p-2 border">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Mix"
                        className="w-[140px] md:w-1/2 border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                      />
                      <input
                        type="time"
                        className="w-[140px] md:w-1/2 border border-gray-300 rounded px-2 py-1 focus:ring focus:ring-blue-100"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}