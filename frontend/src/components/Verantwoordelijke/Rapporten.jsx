import React, { useState } from 'react';

function Rapporten({ data = [] }) {
    return(
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#F8F9FA]">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Datum</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Box</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Tandarts</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Assistent</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Aantal taken</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Soort taken</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.datum}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.box}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.tandarts}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.assistent}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">{item.aantal}</td>
                            <td className="px-6 py-4 text-sm border-b border-gray-100">
                                <span className="bg-[#E1F0FF] text-[#007BFF] px-3 py-1 rounded-md text-xs font-medium border border-[#A5D1FF]">
                                    {item.soort}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm">{item.status}</td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center py-10 text-gray-400 italic">Geen resultaten gevonden voor deze filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

    );

}
export default Rapporten;