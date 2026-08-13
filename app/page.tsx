import Hero from '@/components/home/Hero';
import ProblemSection from '@/components/home/ProblemSection';
import FrameworkSection from '@/components/home/FrameworkSection';
import ServicesOverview from '@/components/home/ServicesOverview';
import WhyLarsva from '@/components/home/WhyLarsva';
import FinalCTA from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <FrameworkSection />
      <ServicesOverview />
      <WhyLarsva />
      <FinalCTA />
    </>
  );
}
