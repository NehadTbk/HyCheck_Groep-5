import React, { useState } from 'react';

function Rapporten() {
    return(
        <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    
                    <tr className="bg-[#F8F9FA]">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700 rounded-l-xl">Datum</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Box</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Tandarts</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Assistent</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Aantal taken</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700">Soort taken</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-700 rounded-r-xl">Status</th>
                    </tr>
                </thead>
            </table>
        </div>

    );

}
export default Rapporten;