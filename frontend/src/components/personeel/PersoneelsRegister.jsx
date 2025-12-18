const Personeelsregister = ({ showAllUsers = false }) => {
    return (
        <div>
            <table className="w-full">
                <thead>
                    <tr>
                        <th>Naam</th>
                        <th>Email</th>
                        <th>Functie</th>
                        <th>Status</th>
                        {showAllUsers && <th>Toegevoegd door</th>}
                    </tr>
                </thead>
                <tbody>
                    {/* Toon gebruikers */}
                </tbody>
            </table>
        </div>
    );
};

export default Personeelsregister;