# HyCheck

HyCheck is een desktop webapp die tandartsassistenten helpt om hun schoonmaaktaken digitaal te registreren, terwijl verantwoordelijken een duidelijk overzicht krijgen van de hygiënestatus per box.

## Doel van het project

In veel tandartspraktijken worden hygiënetaken nog:
- op papier bijgehouden
- mondeling doorgegeven
- of helemaal niet geregistreerd

HyCheck digitaliseert dit proces en zorgt voor:
- transparantie
- tijdsbesparing
- betere opvolging van hygiëneprotocollen

## Gebruikersrollen

### Tandartsassistent
- Ziet toegewezen boxen en taken voor de dag
- Registreert uitgevoerde schoonmaaktaken
- Volgt dagelijkse, wekelijkse en maandelijkse taken
- Bekijkt historiek van voltooide taken
- Snel alle taken afvinken met één klik

### Verantwoordelijke
- Plant boxen per dag en per week via de agenda
- Wijst tandartsen, assistenten en boxen toe
- Stelt shifts in (begin- en eindtijd)
- Krijgt een visueel overzicht van de hygiënestatus per box
- Bekijkt rapporten en exporteert naar PDF/Excel
- Beheert personeel

### Afdelingshoofd (Administrator)
- Beheert gebruikers en rollen
- Beheert boxen en basisconfiguratie
- Toegang tot alle gegevens
- Bekijkt maandoverzichten

## Functionaliteiten

### Weekagenda
- Navigatie per week
- Overzicht per dag en per box
- Dynamische kleuren per taaktype en status
- Drag-and-drop planning (via SchedulingOverlay)

### Schoonmaaktaken
- Ochtend-, avond-, wekelijkse en maandelijkse taken
- Taken per assistent configureerbaar
- Real-time status updates (openstaand, gedeeltelijk, voltooid)
- Mogelijkheid om reden toe te voegen bij niet-voltooide taken

### Boxbeheer
- Boxen worden dynamisch geladen uit de database
- Elke box heeft een eigen kleur en status
- Eén tandarts kan meerdere boxen hebben

### Shiftplanning
- Volledige of gedeeltelijke shifts
- Meerdere assistenten per dag mogelijk
- Taakgroepen toewijzen (ochtend/avond/wekelijks/maandelijks)

### Rapportage
- Maandelijkse rapportages
- Export naar Excel en PDF
- Filtering op datum en assistent
- Status- en redenweergave

### Meertaligheid
- Nederlands (NL)
- Frans (FR)

## Technologieën

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Lucide Icons / React Icons
- i18n voor vertalingen
- XLSX en jsPDF voor exports

### Backend
- Node.js
- Express
- JWT-authenticatie
- MySQL (mysql2)
- Nodemailer voor e-mails
- bcryptjs voor wachtwoord hashing

## Installatie

### Vereisten
- Node.js (v18+)
- MySQL database
- npm of yarn

### Backend setup

```bash
cd backend
npm install
```

Maak een `.env` bestand aan in de backend folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=jouw_wachtwoord
DB_NAME=hycheck
JWT_SECRET=jouw_jwt_secret
PORT=5001
```

Start de backend:
```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
```

Maak een `.env` bestand aan in de frontend folder:
```env
VITE_API_URL=http://localhost:5001
```

Start de frontend:
```bash
npm run dev
```

## Database

Importeer het SQL-schema in je MySQL database. Het schema bevat tabellen voor:
- `users` - Gebruikersbeheer
- `box` - Boxen/kamers
- `shift` - Shifts/diensten
- `shift_assignments` - Toewijzingen
- `shift_task_groups` - Taakgroepen per toewijzing
- `task_type` - Taaktypes
- `cleaning_session` - Schoonmaaksessies
- `cleaning_task_status` - Status per taak
- `comment_option` - Voorgedefinieerde redenen

## Authenticatie

- Login via e-mail en wachtwoord
- JWT-tokens voor beveiligde routes
- Rolgebaseerde toegang (assistant / responsible / admin)
- Wachtwoord reset via e-mail

## Projectstructuur

```
HyCheck_Groep-5/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuratie
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Hulpfuncties
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/     # React componenten
│   │   ├── pages/          # Pagina componenten
│   │   ├── i18n/           # Vertalingen
│   │   └── services/       # API services
│   └── index.html
└── README.md
```

## Auteurs

Groep 5 - Erasmushogeschool Brussel
