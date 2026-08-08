import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products — Larsva',
  description: 'Explore our products at Larsva.',
};

export default function ProductsPage() {
  return (
    <>
      <section className="gradient-hero pt-36 pb-24 px-6 md:px-10 relative overflow-hidden min-h-[50vh] flex flex-col justify-center">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] bg-[radial-gradient(circle,rgba(0,194,168,0.06),transparent_70%)] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-[800px] text-center relative z-10">
          <span className="overline text-[var(--color-accent)] mb-5 block">Products</span>
          <h1 className="font-heading font-bold text-[clamp(2.5rem,5vw,4rem)] tracking-tight leading-tight mb-6 text-white">
            Our <span className="gradient-text">Products</span>
          </h1>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-lg text-white/45 max-w-[560px] mx-auto leading-relaxed">
            Check back soon for our latest products.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white px-6 md:px-10 min-h-[50vh]">
        <div className="mx-auto max-w-[1000px]">
            {/* Add product content here */}
        </div>
      </section>
    </>
  );
}
