import Navbar       from "@/components/home/Navbar";
import Hero         from "@/components/home/Hero";
import Stats        from "@/components/home/Stats";
import Programs     from "@/components/home/Programs";
import Features     from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import Footer       from "@/components/home/Footer";

const Home = () => {
  return (
    <div style={{ background:"hsl(222,70%,10%)" }}>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Programs />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
