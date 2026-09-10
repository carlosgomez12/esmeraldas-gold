export const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Colecciones", href: "/colecciones" },
  { label: "Nuestra historia", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
] as const;

export const footerColumns: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Tienda",
    links: [
      { label: "Catálogo completo", href: "/catalogo" },
      { label: "Anillos", href: "/catalogo?categoria=anillos" },
      { label: "Cadenas y gargantillas", href: "/catalogo?categoria=cadenas-y-gargantillas" },
      { label: "Pendientes", href: "/catalogo?categoria=pendientes" },
      { label: "Edición esmeralda", href: "/colecciones/edicion-esmeralda" },
    ],
  },
  {
    title: "La casa",
    links: [
      { label: "Nuestra historia", href: "/nosotros" },
      { label: "El proceso", href: "/proceso" },
      { label: "Contacto", href: "/contacto" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
    ],
  },
  {
    title: "Legal y ayuda",
    links: [
      { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
      { label: "Política de privacidad", href: "/politica-de-privacidad" },
      { label: "Política de envíos y devoluciones", href: "/politica-de-envios" },
      { label: "Política de cookies", href: "/politica-de-cookies" },
    ],
  },
];