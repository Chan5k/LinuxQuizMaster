# Linux Quiz Master

A full-featured Linux quiz website with authentication, profile dashboard, leaderboard, and 30+ questions across 7 categories.

## Features

- **Interactive Linux Quizzes** – 30+ questions on Commands, File System, Permissions, Networking, Shell & Scripting, Processes, and Package Management
- **Login System** – Register and log in with email/password (JWT-based, secure)
- **Profile Dashboard** – View your quiz history, average scores, and category breakdown
- **Leaderboard** – Compete with other users; top scorers are ranked by average score
- **No Login Required** – Try quizzes without an account; sign up to save progress
- **Responsive Design** – Dark terminal-style theme, works on mobile and desktop

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Initialize the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** – React framework with App Router
- **TypeScript** – Type safety
- **Tailwind CSS** – Styling
- **Prisma** – SQLite database ORM
- **bcryptjs** – Password hashing
- **jose** – JWT authentication

## Project Structure

```
linux-quiz-app/
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── app/
│   │   ├── api/         # API routes (auth, quiz, leaderboard)
│   │   ├── dashboard/   # Profile dashboard
│   │   ├── leaderboard/ # Top scorers
│   │   ├── login/       # Login page
│   │   ├── quiz/        # Quiz and results
│   │   ├── register/    # Sign up page
│   │   └── page.tsx     # Home page
│   ├── components/      # Reusable UI
│   ├── data/            # Quiz questions
│   └── lib/             # DB, auth utilities
└── package.json
```

## Environment Variables (Optional)

- `JWT_SECRET` – Secret for signing JWTs (defaults to a dev value if not set)

For production, set a strong random `JWT_SECRET`.
