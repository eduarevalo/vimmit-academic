import type { Meta, StoryObj } from '@storybook/react';
import { ContentCarousel } from './ContentCarousel';
import { ContentCard } from './ContentCard';
import { ContentSection } from './ContentSection';
import { Container, Stack, Box } from '@mantine/core';

const meta: Meta<typeof ContentCarousel> = {
  title: 'Discovery/Netflix Layout',
  component: ContentCarousel,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ContentCarousel>;

const MOCK_DATA = [
  { 
    title: 'Intro to Astrophysics', 
    description: 'Explore the mysteries of the universe from stars to black holes.',
    longDescription: 'Este curso profundiza en los principios fundamentales de la astrofísica moderna. Aprenderás sobre la evolución estelar, la formación de galaxias y la mecánica de los cuerpos celestes. Ideal para mentes curiosas que buscan entender el cosmos desde una perspectiva científica y empírica.',
    image: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=600&h=400&auto=format&fit=crop',
    badge: 'Nuevo',
    tags: ['Ciencia', 'Astrofísica', '40 Horas']
  },
  { 
    title: 'Modern Architecture', 
    description: 'Design principles for the 21st century institutions.',
    longDescription: 'Descubre cómo la arquitectura moderna está redefiniendo los espacios públicos y académicos. Analizaremos obras de arquitectos líderes mundiales y exploraremos la sostenibilidad como eje central del diseño funcional en el siglo XXI.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&h=400&auto=format&fit=crop',
    badge: 'Popular',
    tags: ['Arquitectura', 'Diseño', 'Sostenibilidad']
  },
  { 
    title: 'Quantum Computing', 
    description: 'Deep dive into qubits and quantum entanglement.',
    longDescription: 'La computación cuántica ya no es ciencia ficción. En este curso avanzado de nivel técnico, exploraremos el procesamiento de información cuántica, la superposición y el entrelazamiento. Incluye laboratorios prácticos con simuladores cuánticos de última generación.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&h=400&auto=format&fit=crop',
    tags: ['Física', 'Tecnología', 'Avanzado']
  },
  { 
    title: 'Ancient Philosophy', 
    description: 'Wisdom from the greats: Plato, Socrates, and Aristotle.',
    longDescription: 'Vuelve a las raíces del pensamiento occidental. Este curso explora las preguntas fundamentales sobre la existencia, la ética y la política planteadas por los filósofos griegos y romanos. Una base esencial para entender el mundo contemporáneo.',
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=600&h=400&auto=format&fit=crop',
    tags: ['Humanidades', 'Historia']
  },
  { 
    title: 'Digital Marketing 101', 
    description: 'Master the arts of social media and SEO.',
    longDescription: 'Aprende las estrategias que dominan el mercado digital actual. Desde el SEO técnico hasta el branding en redes sociales, este curso te proporciona las herramientas prácticas para posicionar cualquier marca en un entorno altamente competitivo.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&h=400&auto=format&fit=crop',
    tags: ['Marketing', 'Negocios', 'Estrategia']
  },
  { 
    title: 'Organic Chemistry', 
    description: 'Understanding molecular structures and reactions.',
    longDescription: 'Un viaje al corazón de la materia orgánica. Estudiaremos los mecanismos de reacción, la síntesis química y la importancia de los compuestos orgánicos en la vida diaria y la industria farmacéutica moderna.',
    image: 'https://images.unsplash.com/photo-1532187875605-19e7a9c14902?q=80&w=600&h=400&auto=format&fit=crop',
    tags: ['Química', 'Ciencia']
  }
];

export const NetflixStyle: Story = {
  render: () => (
    <Box p="xl" bg="gray.0" mih="100vh">
      <Container size="xl">
        <Stack gap="xl">
          <ContentSection title="Continuar viendo" onSeeAll={() => console.log('See all')}>
            <ContentCarousel>
              {MOCK_DATA.slice(0, 4).map((item, i) => (
                <ContentCard key={i} {...item} />
              ))}
            </ContentCarousel>
          </ContentSection>

          <ContentSection title="Recomendados para ti">
            <ContentCarousel>
              {[...MOCK_DATA].reverse().map((item, i) => (
                <ContentCard key={i} {...item} />
              ))}
            </ContentCarousel>
          </ContentSection>

          <ContentSection title="Cursos de Tecnología" onSeeAll={() => {}}>
            <ContentCarousel>
              {[...MOCK_DATA, ...MOCK_DATA].map((item, i) => (
                <ContentCard key={i} {...item} />
              ))}
            </ContentCarousel>
          </ContentSection>
        </Stack>
      </Container>
    </Box>
  ),
};
