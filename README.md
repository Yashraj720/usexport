# Universal Services

Multi-page service marketplace (Node.js + Express + SQLite + vanilla HTML/CSS/JS).

## Run on localhost (VS Code)

Requirements: **Node.js v18 or newer** (download from https://nodejs.org)

1. Open this folder in VS Code.
2. Open a terminal (`Ctrl + ~`) inside this folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open in your browser:
   - Website: http://localhost:3000
   - Admin panel: http://localhost:3000/admin.html
     - Username: `admin`
     - Password: `admin123`

## Where is the data?

A file called `database.db` is created automatically next to `server.js` on first run.
It stores all users (name, mobile, email, encrypted password) and bookings.
You can open it with any SQLite viewer (e.g. the "SQLite Viewer" VS Code extension).

## Default port

The app runs on port **3000**. To change it:
```
PORT=4000 npm start         # Mac / Linux
set PORT=4000 && npm start  # Windows CMD
$env:PORT=4000; npm start   # Windows PowerShell
```

## Folder structure

```
universal-services/
├── server.js            # Express backend + API routes
├── package.json
├── database.db          # auto-created SQLite database
└── public/              # all frontend files
    ├── index.html       # Home
    ├── services.html    # All 65 services
    ├── register.html    # User registration
    ├── login.html       # User login
    ├── dashboard.html   # Customer dashboard
    ├── admin.html       # Admin panel
    ├── app.js           # Shared JS (navbar, modal, API helpers)
    ├── styles.css
    ├── services-data.js # All 65 services
    └── logo.png
```
