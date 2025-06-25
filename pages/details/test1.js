import React from 'react';

const SplitScreen = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Linkes Panel: Rechnungen */}
      <div className="w-1/3 bg-gray-100 flex items-center justify-center border-4 border-blue-500">
        <h1 className="text-2xl font-bold text-gray-800">Rechnungen</h1>
      </div>
      {/* Rechtes Panel: Diagramme */}
      <div className="w-2/3 flex flex-col">
        <div className="flex-1 flex items-center justify-center border-4 border-green-500 bg-white">
          <h1 className="text-2xl font-bold text-gray-800">Diagramm 1</h1>
        </div>
        <div className="flex-1 flex items-center justify-center border-4 border-red-500 bg-white">
          <h1 className="text-2xl font-bold text-gray-800">Diagramm 2</h1>
        </div>
      </div>
    </div>
  );
};

export default SplitScreen;