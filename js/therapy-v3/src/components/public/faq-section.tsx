"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "./fade-in";
import styles from "./faq-section.module.css";

const FAQ = [
  {
    q: "¿Qué diferencia hay entre kinesiología traumatológica y deportiva?",
    a: "La traumatológica trata lesiones resultantes de accidentes o traumatismos (fracturas, esguinces, contusiones), mientras que la deportiva se enfoca en lesiones generadas por la práctica deportiva y en la optimización del rendimiento atlético.",
  },
  {
    q: "¿Necesito derivación médica para sacar turno?",
    a: "No es requisito obligatorio. Si tenés una derivación o estudios complementarios, te pedimos que los traigas a la primera consulta, ya que nos ayudan a diseñar mejor tu plan de tratamiento.",
  },
  {
    q: "¿Cuántas sesiones necesito para ver resultados?",
    a: "Depende del diagnóstico y de cada paciente. Generalmente se observan mejoras a partir de las 3 a 5 sesiones. En la primera consulta evaluamos tu caso y te damos una estimación personalizada.",
  },
  {
    q: "¿En qué consiste el Pilates Terapéutico y en qué se diferencia del convencional?",
    a: "El Pilates Terapéutico está supervisado por kinesióloga/instructora certificada y adaptado para rehabilitación, corrección postural o recuperación de lesiones. El convencional se orienta al fitness y no requiere supervisión clínica.",
  },
  {
    q: "¿Las terapias wellness son solo estéticas o tienen beneficio terapéutico?",
    a: "Tienen ambos beneficios. El drenaje linfático manual, por ejemplo, es ampliamente utilizado en medicina para reducir edemas post-quirúrgicos. La masoterapia y el stretching también aportan beneficios terapéuticos concretos.",
  },
  {
    q: "¿Cómo reservo un turno?",
    a: "Podés reservar directamente desde nuestra web haciendo clic en \"Reservar turno\". Seleccionás el servicio, la profesional, la fecha y el horario disponible, y completás tus datos. También podés contactarnos por WhatsApp.",
  },
  {
    q: "¿Con cuánta anticipación debo cancelar un turno?",
    a: "Pedimos cancelar con al menos 24 horas de anticipación para poder asignar ese espacio a otro paciente. Podés hacerlo desde el link de cancelación que te enviamos por email al confirmar el turno.",
  },
  {
    q: "¿Qué pasa si llego tarde a mi sesión?",
    a: "Intentamos respetar el horario de todos. Si llegás tarde, la sesión puede acortarse para no afectar al siguiente turno. Te recomendamos llegar 5 minutos antes de tu horario.",
  },
  {
    q: "¿Se pueden hacer sesiones más de una vez por semana?",
    a: "Sí, en muchos casos la frecuencia recomendada es de 2 a 3 sesiones semanales, especialmente en etapas agudas de rehabilitación. La profesional te indicará la frecuencia ideal según tu diagnóstico.",
  },
  {
    q: "¿Tienen convenio con obras sociales o prepagas?",
    a: "Por el momento trabajamos con consulta privada. Si tenés cobertura médica, podés solicitar el recibo y gestionarlo ante tu prestadora. Algunas cubren sesiones de kinesiología con derivación médica.",
  },
  {
    q: "¿Dónde están ubicados y hay estacionamiento cerca?",
    a: "Estamos en Montecaseros 2396 esq. Champagnat, Mendoza. Hay estacionamiento en la calle y estacionamientos privados a media cuadra del consultorio.",
  },
  {
    q: "¿Qué debo llevar a la primera consulta?",
    a: "DNI, orden médica o estudios si tenés (radiografías, resonancias, etc.), ropa cómoda y calzado deportivo. Si venís por tratamiento postquirúrgico, traé el protocolo del cirujano.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="section"
      style={{ backgroundColor: "var(--bg-canvas)" }}
    >
      <div className="container">
        <FadeIn className="text-center mb-12">
          <span className="eyebrow mb-3 block">Preguntas frecuentes</span>
          <h2
            className="font-display text-[var(--text-emphasis)]"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            Todo lo que necesitás saber
          </h2>
        </FadeIn>

        <FadeIn className="max-w-3xl mx-auto" delay={0.1}>
          <Accordion.Root type="single" collapsible>
            {FAQ.map((item, i) => (
              <Accordion.Item
                key={i}
                value={`item-${i}`}
                className="border-b"
                style={{ borderColor: "var(--border-color-subtle)" }}
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors duration-200 group"
                    style={{ color: "var(--text-emphasis)" }}
                  >
                    <span
                      className="font-medium"
                      style={{ fontSize: "var(--text-base)" }}
                    >
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      style={{ color: "var(--color-primary)" }}
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content
                  className={`overflow-hidden ${styles.content}`}
                >
                  <div
                    className="pb-5 leading-relaxed"
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    {item.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </FadeIn>
      </div>
    </section>
  );
}
