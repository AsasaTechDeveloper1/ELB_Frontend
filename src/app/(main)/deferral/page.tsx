// src/app/(main)/documents/FormElementsPage.tsx ✅ CLIENT SIDE
'use client';

import { useState } from 'react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import MainHero from '../(home)/_components/overview-cards/hero';
import HeroAsside from '../(home)/_components/overview-cards/heroasside';
// import other components here...

// const tabs = [
//   { id: 'CHART 1', label: 'Chart 1', content: 'EACH CHART BOX ON THE LEFT REPRESENTS A PARTICULAR CHART FOR RECORDING DAMAGE ON THE CHART. ON THE CHART THE THE POINT IS REPRESENTED BY ANY LETTER AND BY CLICKING THE LETTERS A DESCRIPTION OPENS UP AT BOTTOM TO ANNOUNCE ANY WORK DONE AND THE STS OF THE DAMAGE' },
//   { id: 'CHART 2', label: 'Chart 2', content: 'This is content for Chart 2' },
//   { id: 'CHART 3', label: 'Chart 3', content: 'This is content for Chart 3' },
//   { id: 'CHART 4', label: 'Chart 4', content: 'This is content for Chart 4' },
//   { id: 'CHART 5', label: 'Chart 5', content: 'This is content for Chart 5' },
//   { id: 'CHART N', label: 'Chart N', content: 'This is content for Chart N' },
// ];

const tabs = [
  {
    id: 'CHART 1',
    label: 'Chart Preview 1',
    content: (
      <div>
        <img
          src="https://dummyimage.com/800x500/cccccc/000000&text=Chart+Preview+1"
          alt="Chart 1"
          className="w-full h-auto rounded shadow mb-4"
        />
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold mb-2 text-blue-900">Selected Point: A</h4>
          <p className="text-sm text-blue-800">
            Damage noted on fuselage near cargo hold. Repaired on 03 June 2025. No further action required.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'CHART 2',
    label: 'Chart Preview 2',
    content: (
      <img
        src="https://dummyimage.com/800x500/cccccc/000000&text=Chart+Preview+2"
        alt="Chart 2"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'CHART 3',
    label: 'Chart Preview 3',
    content: (
      <img
        src="https://dummyimage.com/800x500/cccccc/000000&text=Chart+Preview+3"
        alt="Chart 3"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'CHART 4',
    label: 'Chart Preview 4',
    content: (
      <img
        src="https://dummyimage.com/800x500/cccccc/000000&text=Chart+Preview+4"
        alt="Chart 4"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'CHART 5',
    label: 'Chart Preview 5',
    content: (
      <img
        src="https://dummyimage.com/800x500/cccccc/000000&text=Chart+Preview+5"
        alt="Chart 5"
        className="w-full h-auto rounded shadow"
      />
    )
  },
  {
    id: 'CHART N',
    label: 'Chart Preview N',
    content: (
      <img
        src="https://dummyimage.com/800x500/cccccc/000000&text=Chart+Preview+N"
        alt="Chart N"
        className="w-full h-auto rounded shadow"
      />
    )
  }
];


export default function FormElementsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <>
      {/* <div className="grid gap-4 sm:grid-cols-12 sm:gap-4 xl:grid-cols-12 2xl:gap-4 mb-8">
        <div className="col-span-9">
          <MainHero />
        </div>
        <div className="col-span-3 mt-4">
          <HeroAsside />
        </div>
      </div> */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <ul className="flex md:flex-col gap-2">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                className={`cursor-pointer px-4 py-2 rounded-md transition-all text-center md:text-left ${
                  activeTab === tab.id
                    ? 'bg-[rgb(0,64,81)] text-white shadow-md'
                    : 'bg-white hover:bg-[rgba(0,64,81,0.1)] text-black'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 md:col-span-9">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">{activeTab.toUpperCase()}</h2>
            <p className="mb-2">
              EACH CHART BOX ON THE LEFT REPRESENTS A PARTICULAR CHART FOR RECORDING DAMAGE ON THE CHART. ON THE CHART THE THE POINT IS REPRESENTED BY ANY LETTER AND BY CLICKING THE LETTERS A DESCRIPTION OPENS UP AT BOTTOM TO ANNOUNCE ANY WORK DONE AND THE STS OF THE DAMAGE 
            </p>
            <div>{activeContent}</div>
          </div>
        </div>
      </div>
    </>
  );
}
