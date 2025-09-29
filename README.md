# Trullo-individuell-uppgift

Om man vill lägga till en task till ett projekt så måste man skapa en ny task. Tanke var att man bara ska kunna skapa tasks inuti projekt fårn början men tidsbrist satte krokben.

### Instruktioner för användning

1. Skapa en .env fil i roten av projektet och följ exemplen i env.examples

2. Kör 'npm run seed' för att fylla db med fake users, tasks och projects.

3. Kör 'npm run dev' för att starta servern

För att kunna använda alla funktioner så måste man auktorisera sig med en token. Alla routes är skyddade förutom den där man skapar en user och den där man loggar in:

1. Skapa en user genom "/users POST"

2. Logga in genom "/auth/signin POST"

3. Kopiera sedan token som du får i responsen och klistra in i "Bearer token" varje gång du ska kontakta en skyddad route.

### Beskrivning av appen
Den är i grunden uppbyggd enligt instruktioner med tasks och users. Har sedan byggt vidare med en enkel variant av projekt resurser som kan innehålla tasks och users.
Projekt har arrayer för tasks, "tasks", och för users "members". Till members kan man lägga till vilken befintlig user som helst. Till tasks så måste man skapa en ny task för att kunna lägga till den i ett projekt. Tanken var först att tasks endast skulle existera i projekt, därav så saknas funktionalitet att lägga till befintliga tasks.

### Val av databas
Jag valde att använda en nosql databas, mongodb. 
Eftersom trullo är en variant av trello så tänkte jag att det är en applikation som har potential att få många nya användare på kort tid då den vänder sig till i princip vem som helst som behöver projekt-hantering. Det finns ingen känd mängd data från början eller en förutsägbar mängd data i framtiden. Av detta så tänkte jag att man bör använda sig av en databas som är lätt att skala upp och därför beslutade jag nosql.

Datan i sig tänker jag i det här fallet inte är så känslig så alla kontroller som sker i sql med transaktioner och annat kändes inte viktiga nog för att välja sql.

### Tekniker

#### Dependencies

##### Express
Används för att skapa en server

##### Mongoose
ODM som används för att underlätta kommunikation med mongodb

##### Dotenv
För att kunna läsa .env filen

##### Bcrypt
Används för att kunna hasha lösenord innan de lagras i db

##### Jsonwebtoken
Används för att skapa tokens som en inloggad användare auktoriserar sig med

##### Zod
Används för validering av input data

#### Dev dependencies

##### Nodemon
Används för att starta om servern efter att filändringar har gjorts

##### Typescript
Compile-time validering

##### Faker.js
Genererar fake data för seed av db

