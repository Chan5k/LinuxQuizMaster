import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
          Linux Quiz Master
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Test your Linux knowledge from easy to hacker level. Master commands, permissions, networking, and more.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:border-emerald-500/40 hover:shadow-glow transition-all duration-300">
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-2">Interactive Quizzes</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            85+ questions across 12 categories. Filter by difficulty: Easy, Medium, Hard, Extreme, or Hacker.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:border-cyan-500/40 transition-all duration-300">
          <div className="text-3xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Track Progress</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create an account to save your scores, view your dashboard, and climb the leaderboard.
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:border-violet-500/40 transition-all duration-300">
          <div className="text-3xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-violet-400 mb-2">Learn as You Go</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Each question includes explanations so you understand why an answer is correct.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/quiz"
          className="px-8 py-4 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors text-center shadow-lg shadow-emerald-500/20"
        >
          Start Quiz
        </Link>
        <Link
          href="/register"
          className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors text-center"
        >
          Create Account
        </Link>
      </div>

      <div className="mt-20 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 font-mono text-sm">
        <p className="text-emerald-400 mb-2">$ cat welcome.txt</p>
        <p className="text-slate-400">
          Welcome to Linux Quiz Master! Whether you&apos;re a beginner or seasoned sysadmin,
          our quizzes will challenge and expand your knowledge. No account needed to try—
          but sign up to save your progress and compete on the leaderboard.
        </p>
      </div>
    </div>
  );
}
