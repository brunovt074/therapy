import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { FadeIn } from "./fade-in";

const WHATSAPP_URL =
  "https://wa.me/542604007766?text=Hola%21%20Quiero%20consultar%20sobre%20turnos.";

export function ContactSection() {
  return (
    <section
      id="contacto"
      className="section"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container">
        <FadeIn className="text-center mb-12">
          <span className="eyebrow mb-3 block">Contacto</span>
          <h2
            className="font-display text-[var(--text-emphasis)]"
            style={{ fontSize: "var(--text-3xl)" }}
          >
            Encontranos
          </h2>
          <p
            className="mt-4 mx-auto text-[var(--text-secondary)]"
            style={{ maxWidth: "48ch", fontSize: "var(--text-lg)" }}
          >
            Estamos en el corazón de Mendoza. Reservá online o escribinos por WhatsApp.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact info */}
          <FadeIn direction="left">
            <div
              className="h-full flex flex-col gap-6 p-8 rounded-[var(--radius-xl)]"
              style={{
                backgroundColor: "var(--bg-canvas)",
                border: "1px solid var(--border-color-subtle)",
              }}
            >
              <h3
                className="font-display text-[var(--text-emphasis)]"
                style={{ fontSize: "var(--text-xl)" }}
              >
                Datos del consultorio
              </h3>

              <ul className="space-y-5">
                <li className="flex gap-3.5">
                  <div
                    className="shrink-0 flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <MapPin size={17} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--text-emphasis)]">Dirección</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      Montecaseros 2396 esq. Champagnat
                      <br />
                      Mendoza, Argentina
                    </p>
                  </div>
                </li>

                <li className="flex gap-3.5">
                  <div
                    className="shrink-0 flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <Phone size={17} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--text-emphasis)]">Teléfono / WhatsApp</p>
                    <a
                      href="tel:+542604007766"
                      className="text-sm no-underline transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      260-4007766
                    </a>
                  </div>
                </li>

                <li className="flex gap-3.5">
                  <div
                    className="shrink-0 flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]"
                    style={{ backgroundColor: "var(--bg-tertiary)" }}
                  >
                    <Clock size={17} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--text-emphasis)]">Horarios</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      Lunes a Viernes: 8:00 – 20:00
                      <br />
                      Sábados: 9:00 – 13:00
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-2 flex flex-col gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-[var(--radius-md)] font-semibold text-sm no-underline transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: "#25D366",
                    color: "#fff",
                  }}
                >
                  <MessageCircle size={18} />
                  Escribir por WhatsApp
                </a>
                <a
                  href="/appointments"
                  className="inline-flex items-center justify-center py-3 px-5 rounded-[var(--radius-md)] font-semibold text-sm no-underline transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-accent)]"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--text-on-accent)",
                  }}
                >
                  Reservar turno online
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Map */}
          <FadeIn direction="right">
            <div
              className="overflow-hidden rounded-[var(--radius-xl)] h-full min-h-[360px]"
              style={{ border: "1px solid var(--border-color-subtle)" }}
            >
              <iframe
                title="Ubicación Therapy Consultorio"
                src="https://maps.google.com/maps?q=Montecaseros+2396+Mendoza+Argentina&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "360px", display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
