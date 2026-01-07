# HyCheck_Groep-5
Hycheck is een desktop webapp die tandartsassistenten helpt om hun schoonmaaktaken digitaal te registreren, terwijl verantwoordelijken een duidelijk overzicht krijgen van de hygiënestatus per box.

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
- Ziet toegewezen boxen en taken
- Registreert uitgevoerde schoonmaaktaken
- Volgt dagelijkse, wekelijkse en maandelijkse taken

### Verantwoordelijke
- Plant boxen per dag en per week
- Wijst tandartsen, assistenten en boxen toe
- Stelt shifts in (begin- en eindtijd)
- Krijgt een visueel overzicht van de hygiënestatus per box

### Administrator
- Beheert gebruikers
- Beheert boxen en basisconfiguratie
- Toegang tot alle gegevens


## Functionaliteiten

- **Weekagenda**
  - Navigatie per week
  - Overzicht per dag en per box
  - Dynamische kleuren per status

- **Schoonmaaktaken**
  - Ochtend-, avond-, wekelijkse en maandelijkse taken
  - Taken per assistent configureerbaar
  - Taken kunnen individueel in- of uitgeschakeld worden

- **Boxbeheer**
  - Boxen worden dynamisch geladen uit de database
  - Elke box heeft een eigen kleur en status
  - Eén tandarts kan meerdere boxen hebben

- **Shiftplanning**
  - Volledige of gedeeltelijke shifts
  - Meerdere assistenten per dag mogelijk


## Technologieën

### Frontend
- React
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Node.js
- Express
- JWT-authenticatie
- MySQL


## Authenticatie

- Login via e-mail en wachtwoord
- JWT-tokens voor beveiligde routes
- Rolgebaseerde toegang (assistant / responsible / admin)


## Installatie

Frontend
- npm install react-icons --save

#Initialiseren backend
In integrated terminal run je het commando: npm init -y
Daarna mag je deze commandos ook runnen:
- npm install express
- npm install mysql2
- npm install dotenv
- npm install cors
- npm install jsonwebtokens
- npm install bcryptjs
- npm install express-rate-limit
- npm install
- npm install nodemailer
- npm install xlsx
- npm install jspdf jspdf-autotable 

Voor dev: 
- npm install --save-dev nodemon // deze zorgt ervoor dat wij onze webapp niet constant moeten sluiten en heropenen na het opslaan van aanpassingen
