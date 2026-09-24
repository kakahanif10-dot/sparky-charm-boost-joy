import { motion } from 'framer-motion'
import { Code2, Compass, MessageSquareText } from 'lucide-react'

const TEAM = [
  {
    icon: Compass,
    role: 'Product',
    title: 'Built around the way ideas begin',
    body: 'The product team turns an early thought into a clear, guided path from prompt to working software.',
  },
  {
    icon: Code2,
    role: 'Engineering',
    title: 'Production quality from the start',
    body: 'The engineering team focuses on reliable generation, fast previews, and code that remains yours to evolve.',
  },
  {
    icon: MessageSquareText,
    role: 'Customer experience',
    title: 'A builder that speaks your language',
    body: 'The experience team keeps every interaction direct and approachable, whether you code or not.',
  },
]

export function People() {
  return (
    <section id="team" className="relative px-4 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            id="founder"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-foreground p-8 text-background md:p-10"
          >
            <p className="text-sm font-medium text-background/65">About the founder</p>
            <h2 className="mt-4 text-balance text-3xl font-semibold md:text-4xl">
              Software creation should start with an idea, not a setup guide.
            </h2>
            <p className="mt-6 text-pretty leading-relaxed text-background/70">
              SUPERINTELLIGENS was founded on a simple belief: anyone with a clear idea should be able to turn it into useful software. The product brings planning, design, code, and deployment into one creative conversation.
            </p>
          </motion.div>

          <div>
            <p className="text-sm font-medium text-primary">The team</p>
            <h2 className="mt-3 max-w-xl text-balance text-4xl font-semibold md:text-5xl">
              A small team focused on making software creation feel natural
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {TEAM.map((member, index) => (
                <motion.div
                  key={member.role}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="grid gap-4 rounded-2xl bg-card p-5 lg:grid-cols-[auto_1fr]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary">
                    <member.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">{member.role}</p>
                    <h3 className="mt-1 font-medium text-foreground">{member.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{member.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}