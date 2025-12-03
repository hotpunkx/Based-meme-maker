import { MemeGenerator } from "@/components/MemeGenerator";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Meme Maker</h1>
          <p className="text-muted-foreground">Your gateway to Based memes.</p>
        </header>
        <MemeGenerator />
      </div>
    </main>
  );
};

export default Index;
