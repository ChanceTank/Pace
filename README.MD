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

* **Database:** [SQLite3](https://sqlite.org/) (via `sqlite3`)

* **Build Tool:** [Electron Forge](https://www.electronforge.io/)

---

## 📊 Database Schema (Preview)

As a local-first SQL app, the data integrity is built on:

* `circles`: Defines the "templates" for social frequency (name, frequency in days).

* `friends`: The individuals mapped to specific circles (name, circle association, last contact date).

* `interactions`: A log of every interaction (friend, date, notes).

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

4\. Build the Windows executable:

```bash

npm run make

```

---

## 🛡 Privacy

Pace is strictly **offline**. It does not transmit data to any external servers. Your social data is yours, and it stays on your hard drive.

---

