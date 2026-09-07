import React from 'react';
import { Sparkles, Layers, Clock, ShieldCheck } from 'lucide-react';

export function RitualSection() {
  const steps = [
    {
      icon: Layers,
      num: '01',
      title: 'Le Layering Solaire',
      desc: 'Associez une touche de musc ou d’huile parfumée sur les points chauds avant de vaporiser votre eau de parfum pour décupler la tenue.',
    },
    {
      icon: Sparkles,
      num: '02',
      title: 'Les Points de Pulsation',
      desc: 'Appliquez sur les poignets, la base du cou et l’arrière des oreilles sans frotter pour laisser les molécules s’épanouir naturellement.',
    },
    {
      icon: Clock,
      num: '03',
      title: 'Laisser Respirer',
      desc: 'Laissez les notes de tête pétiller 10 à 15 minutes pour apprécier toute la richesse du cœur et du sillage de fond.',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F3ECE2] border-t border-[#E8DCC2]">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[11px] font-bold text-[#967120] uppercase tracking-widest">
            Conseils Parfumerie
          </span>
          <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#171513]">
            Sublimer votre sillage
          </h2>
          <p className="text-xs sm:text-sm text-[#6B655E]">
            Des rituels simples pour maximiser la présence et la diffusion de votre parfum à Dakar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-[#E8DCC2] space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DCC2] text-[#C59B3F]">
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="font-mono text-xl font-bold text-[#D8CCB5]">{step.num}</span>
              </div>
              <h3 className="font-luxury text-base font-bold text-[#171513]">{step.title}</h3>
              <p className="text-xs text-[#6B655E] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
