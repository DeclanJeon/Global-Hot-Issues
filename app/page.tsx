import MainLayout from '@/components/MainLayout';

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            G
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Global Hot Issues</h1>
        </div>
        <div className="text-sm text-slate-500">
          Powered by OpenStreetMap & Gemini AI
        </div>
      </header>
      
      <div className="flex-1 relative flex overflow-hidden">
        <MainLayout />
      </div>
    </main>
  );
}
