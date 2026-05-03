# ResiliNet — Distributed Emergency Response System

## Prerequisites
Make sure you have these installed:
- Node.js 20+

## Setup

### 1. Clone the repository
git clone https://github.com/hassan453837/resilinet-distribution.git
cd resilinet-distribution

### 2. Install dependencies
In root directory, pnpm install

### 3. Create `.env` file in the root folder
Create a file called `.env` and add:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

## Running the Project

### Terminal 1 — Start the Hub Server
node server.js
You should see: `Hub server running on port 3001`

### Terminal 2 — Start the Frontend
cd artifacts/resilinet
pnpm run dev
Open `http://localhost:5000` in your browser.


## Testing Distributed Features

### Test 1 — Real-time Sync
- Open the app in two different browsers
- Login as different organizations
- Add an incident — it appears on all screens instantly

### Test 2 — Fault Tolerance
- Login in Browser 1
- Close Browser 1
- Watch the node turn red/offline in Browser 2 automatically