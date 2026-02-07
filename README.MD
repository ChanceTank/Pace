# Pace

**Pace** is a standalone Windows desktop application designed to help you intentionally manage your social life. Instead of relying on "vibe-based" scheduling, Pace acts as a personal social steward, tracking the frequency of your interactions and nudging you when it's time to reconnect with the people who matter most.

## 🌟 The Concept

Most social tracking happens in our heads or buried in text history. **Pace** brings your social "circles" into focus, allowing you to set specific frequencies for different groups of friends (e.g., Inner Circle every 2 weeks, Casual Friends every 2 months) and providing a visual "heartbeat" of your social health.

---

## 🚀 Key Features

* **Social Circles:** Define custom groups with target interaction frequencies.

* **Interaction Logging:** Quick-click buttons to log hangouts, calls, or texts.

* **Smart Reminders:** A "Health" dashboard that highlights which friends are falling out of their intended Pace.

* **Local-First Privacy:** All data is stored in a local SQLite database on your machine. No cloud, no tracking, no data-mining.

* **Standalone Performance:** Built with Electron, it runs as a native Windows app with zero network dependency.

---

## 🛠️ Technical Stack

* **Runtime:** [Node.js](https://nodejs.org/)

* **Framework:** [Electron](https://www.electronjs.org/) (Desktop GUI)

* **Frontend:** [React](https://reactjs.org/)

* **Backend:** [Express](https://expressjs.com/)

* **Database:** [SQLite3](https://sqlite.org/) (via `better-sqlite3`)

* **Build Tool:** [Electron Forge](https://www.electronforge.io/)

* **Testing:** [Mocha](https://mochajs.org/) with [Chai](https://www.chaijs.com/)

---

## 📊 Database Schema (Preview)

As a local-first SQL app, the data integrity is built on the following tables:

* `people`: Stores individual contacts (name, birthday, anniversary, preferred communication, profile picture).

* `circles`: Defines social frequency templates (name, meeting frequency).

* `covenant_types`: Types of social covenants or commitments (name, description).

* `checkins`: Logs of interactions with people (person_id, duration, notes, summary feeling, topics, next followup date).

* `groups`: Social groups (name, description, meeting frequency).

* `action_items`: Tasks or follow-ups from checkins (person_id, description, due date, status).

* `tags`: Custom tags for categorization.

* Linking tables: `person_tags`, `person_groups`, `person_circles`, `person_covenant_types`, `checkin_tags`, `action_item_tags`, `checkin_covenant_types` for many-to-many relationships.

---

## 🔌 API Endpoints

The application provides a REST API for managing social data. The server runs locally on port 3000. Key endpoints include:

* **Circles:** `/api/circles` (GET, POST, PUT, DELETE)
* **People:** `/api/people` (GET, POST, PUT, DELETE)
* **Checkins:** `/api/checkins` (GET, POST, PUT, DELETE), `/api/checkins/person/:personId` (GET)
* **Groups:** `/api/groups` (GET, POST, PUT, DELETE)
* **Action Items:** `/api/action_items` (GET, POST, PUT, DELETE)
* **Covenant Types:** `/api/covenant_types` (GET, POST, PUT, DELETE)
* **Tags:** `/api/tags` (GET, POST, PUT, DELETE)

All endpoints support standard CRUD operations with JSON payloads.

---

## 🛠 Installation \& Development

### Prerequisites

* Node.js (v18 or higher recommended)

* A C++ compiler (required for `sqlite3` native compilation)

### Setup

1\. Clone the repository:

```bash

git clone https://github.com/your-username/Pace.git

```

2\. Install dependencies:

```bash

npm install

```

3\. Start the application in development mode:

```bash

npm start

```

4\. (Optional) Run the backend server separately for development:

```bash

npm run server

```

5\. Run tests:

```bash

npm test

```

6\. Build the Windows executable:

```bash

npm run make

```

---

## 🛡 Privacy

Pace is strictly **offline**. It does not transmit data to any external servers. Your social data is yours, and it stays on your hard drive.

---

