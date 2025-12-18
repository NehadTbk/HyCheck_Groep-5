import React, { useState } from 'react';
function RapportFilter() {
    return(
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Periode</label>
                            <select className="border border-gray-300 rounded-md p-2 bg-white outline-none focus:ring-1 focus:ring-purple-400">
                                <option>Aangepast</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Van datum</label>
                            <input 
                                type="text" 
                                className="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-purple-400"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Tot datum</label>
                            <input 
                                type="text" 
                                 
                                className="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-purple-400"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Assistent</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Zoek assistent..." 
                                    className="w-full border border-gray-300 rounded-md p-2 pl-10 outline-none focus:ring-1 focus:ring-purple-400"
                                />
                            </div>
                        </div>
            </div>
    );


}
export default RapportFilter;
