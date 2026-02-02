import React from 'react';

interface SliderControlsProps {
  onPrev: () => void;
  onNext: () => void;
  current: number;
  total: number;
}

const SliderControls: React.FC<SliderControlsProps> = ({ onPrev, onNext, current, total }) => (
  <div className="flex items-center justify-center space-x-10 mt-8 bg-white py-4 px-10 rounded-full border border-slate-100 w-fit mx-auto shadow-xl">
    <button onClick={onPrev} className="w-12 h-12 rounded-full bg-slate-50 shadow-md flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform hover:scale-110 active:scale-95">
      <i className="fa-solid fa-arrow-left"></i>
    </button>
    <div className="flex space-x-2.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-2 rounded-full transition-all duration-500 ${current === i ? 'w-10 bg-blue-900' : 'w-2 bg-slate-200'}`}></div>
      ))}
    </div>
    <button onClick={onNext} className="w-12 h-12 rounded-full bg-slate-50 shadow-md flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all transform hover:scale-110 active:scale-95">
      <i className="fa-solid fa-arrow-right"></i>
    </button>
  </div>
);

export default SliderControls;