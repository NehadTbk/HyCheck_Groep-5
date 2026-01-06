import { use, useEffect, useState } from "react";
import { X, Plus, Trash2, Clock } from "lucide-react";

const [dentists, setDentists] = useState(null);

useEffect(() => {
    async function fetchDentists() {
        const response = await fetch("/api/dentists");
        const data = await response.json();
        setDentists(data);
    }

    fetchDentists();
}, []);

const dentistNames = dentists ? dentists.map(dentist => dentist.name) : [];

export default dentistNames;