'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedContainer, AnimatedItem } from '@/components/ui/animated-container';

const features = [
  {
    icon: '🔗',
    title: 'One Link, Everyone Responds',
    description: 'Share a single link via WhatsApp, Slack, or email. Guests join with just their name — no account needed.',
    gradient: 'from-primary to-violet',
  },
  {
    icon: '📊',
    title: 'See the Best Time',
    description: 'A beautiful heatmap shows where everyone overlaps. Pick the perfect time in seconds, not hours.',
    gradient: 'from-violet to-purple-500',
  },
  {
    icon: '🌍',
    title: 'Timezone Magic',
    description: 'Auto-detects everyone\'s timezone. All times displayed in each person\'s local time. No confusion, ever.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export function Features() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            How it works
          </h2>
          <p className="text-text-secondary text-lg">
            Three steps to the perfect meeting time
          </p>
        </motion.div>

        <AnimatedContainer className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedItem key={i}>
              <GlassCard hover className="h-full text-center">
                {/* Icon with glow */}
                <div className="mb-4">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                {/* Decorative gradient line */}
                <div className={`h-1 w-12 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} mb-4`} />
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      </div>
    </section>
  );
}
