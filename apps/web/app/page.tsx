export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-green-50 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4 font-bangla">
        🐾 প্রাণোরা · Pranora
      </h1>
      <p className="text-lg text-black/87 mb-8 max-w-xl font-bangla">
        আপনার পোষা প্রাণীর সম্পূর্ণ যত্ন, এক জায়গায়।
      </p>
      <div className="flex gap-4">
        <a
          href="/services"
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-green-700 transition"
        >
          সেবাসমূহ দেখুন
        </a>
        <a
          href="/emergency"
          className="px-6 py-3 rounded-lg bg-emergency text-white font-medium hover:opacity-90 transition"
        >
          🚨 জরুরি সেবা
        </a>
      </div>
    </main>
  );
}

