import React, { useState } from 'react';
import { IoSearch } from "react-icons/io5";


function RapportFilter({ filters, onFilterChange }) {
    return(
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Periode</label>
                            <select className="border border-gray-300 rounded-md p-2 bg-white outline-none focus:ring-1 focus:ring-purple-400"
                                value={filters.periode || "Aangepast"}
                                onChange={(e) => onFilterChange("periode", e.target.value)}
                                >
                                <option>Aangepast</option>
                                <option>Dagelijks</option>
                                <option>Wekelijks</option>
                                <option>Maandelijks</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Van datum</label>
                            <input 
                                type="date"
                                value = {filters.vanDatum}
                                onChange={(e) => onFilterChange("vanDatum", e.target.value)}
                                className="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-purple-400"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Tot datum</label>
                            <input 
                                type="date" 
                                value = {filters.totDatum}
                                onChange={(e) => onFilterChange("totDatum", e.target.value)}
                                className="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-purple-400"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Assistent</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={filters.assistentZoek}
                                    onChange={(e) => onFilterChange("assistentZoek", e.target.value)}
                                    placeholder="Zoek assistent..." 
                                    className="w-full border border-gray-300 rounded-md p-2 pl-10 outline-none focus:ring-1 focus:ring-purple-400"
                                />
                                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>
            </div>
    );


}
export default RapportFilter;