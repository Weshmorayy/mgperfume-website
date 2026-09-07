import React from 'react';
import { Sparkles, Layers, ShieldCheck, Clock } from 'lucide-react';

export function RitualSection() {
  const steps = [
    {
      icon: Layers,
      num: '01',
      title: 'Le Layering Parfumé',
      desc: 'Pour un sillage qui dure toute la journée, associez votre musc crémeux à votre eau de parfum sur les points de pulsation.',
    },
    {
      icon: Sparkles,
      num: '02',
      title: 'Les Points Clés',
      desc: 'Vaporisez sur le cou, l’arrière des oreilles et les poignets sans frotter afin de préserver l’intégrité des molécules olfactives.',
    },
    {
      icon: Clock,
      num: '03',
      title: 'Évolution & Tenue',
      desc: 'Laissez les notes de tête s’ouvrir pendant 15 minutes pour découvrir le cœur opulent et la signature de fond.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0908] via-[#12100E] to-[#0A0908] border-y border-[#D4AF37]/15">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
            Conseil des Maîtres Parfumeurs
          </span>
          <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-[#FBF8F3]">
            L’Art de Porter son Parfum
          </h2>
          <p className="text-sm text-[#A8A196]">
            Des gestes simples pour magnifier la projection et faire de chaque fragrance une signature inoubliable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#151310] border border-[#D4AF37]/20 relative space-y-4 hover:border-[#D4AF37]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#0A0908] border border-[#D4AF37]/30 text-[#D4AF37]">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-2xl font-bold text-[#D4AF37]/30">{step.num}</span>
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#FBF8F3]">{step.title}</h3>
              <p className="text-xs text-[#A8A196] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
