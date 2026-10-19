export const site = {
  name: "Palace Lounge",
  location: "Palácio de Ferro, Luanda, Angola",
  shortLocation: "Palácio de Ferro · Luanda",
  instagram: "https://www.instagram.com/palace_lounge_ao/",
  instagramHandle: "@palace_lounge_ao",
  maps: "https://www.google.com/maps/search/?api=1&query=Palace+Lounge+Pal%C3%A1cio+de+Ferro+Luanda+Angola",
  phone: null as string | null,
  email: null as string | null,
  openingHours: null as string | null,
  logo: "/media/logos/palace-lounge-oficial.webp",
  video: "/media/videos/palace.mp4",
  heroVideo: "/media/videos/palace-gastronomia.mp4",
  poster: "/media/gastronomia/hero-poster.webp",
  menuOriginal: "/media/menu/menu-original.webp",
  menuDate: "19 de Outubro de 2026",
  nav: [
    { label: "Início", href: "/#inicio" },
    { label: "O Palace", href: "/#o-palace" },
    { label: "Menu", href: "/menu" },
    { label: "Experiências", href: "/#experiencias" },
    { label: "Palace Privé", href: "/#palace-prive" },
    { label: "Contactos", href: "/#contactos" },
  ],
  story: {
    eyebrow: "A essência do Palace",
    title: "A arte de receber, em cada detalhe.",
    text: "No Palace Lounge, a gastronomia, o ambiente e a atenção aos detalhes encontram-se para proporcionar momentos verdadeiramente especiais.",
    detail: "Há lugares que nos convidam a ficar. A abrandar. A brindar. No coração de Luanda, descubra o seu próximo lugar à mesa.",
  },
};

export const photos = {
  table: { src: "/media/ambiente/a-mesa.webp", alt: "Mesa do Palace Lounge com cocktail, candeeiro dourado e o bar ao fundo" },
  terrace: { src: "/media/ambiente/terraco.webp", alt: "Esplanada do Palace Lounge com mesas preparadas e iluminação acolhedora" },
  entrance: { src: "/media/ambiente/entrada.webp", alt: "Entrada iluminada do Palace Lounge com a identificação oficial do restaurante" },
  food: { src: "/media/gastronomia/a-partilha.webp", alt: "Selecção de peixe grelhado e acompanhamentos servidos à mesa no Palace" },
  cocktails: { src: "/media/experiencias/cocktails.webp", alt: "Brinde com cocktails de fruta à mesa do Palace Lounge" },
  details: { src: "/media/experiencias/detalhes.webp", alt: "Carta do Palace, azeitonas e pormenores dourados de uma mesa preparada" },
};

export const experiences = [
  { number: "01", title: "Jantares a Dois", text: "Tempo para os dois. Um cenário à altura do momento.", photo: photos.table, occasion: "Jantar a dois" },
  { number: "02", title: "Celebrações", text: "Às boas companhias. Aos momentos que ficam.", photo: photos.cocktails, occasion: "Celebração" },
  { number: "03", title: "Encontros Privados", text: "Conversas que merecem um ambiente distinto.", photo: photos.terrace, occasion: "Encontro privado" },
];

export type MenuItem = { name: string; description?: string; price: number; unit?: string };
export type MenuCategory = { id: string; title: string; subtitle: string; items: MenuItem[] };

// Transcrição do menu original fornecido. Actualizar aqui sem alterar a interface.
export const menuCategories: MenuCategory[] = [
  { id: "entradas", title: "Para começar", subtitle: "Sopa & entrada do dia", items: [
    { name: "Caldo Verde", price: 5000 },
    { name: "Ostra da Tasão", description: "Entrada do dia", price: 12000 },
  ] },
  { id: "peixe-marisco", title: "Do mar à mesa", subtitle: "Sugestões do chef · Peixe & marisco", items: [
    { name: "Mista de Frito", description: "Com arroz com feijão", price: 20000 },
    { name: "Polvo à Lagareiro", price: 21500 },
    { name: "Atum ao Alho", price: 20000 },
    { name: "Cabeça de Cherne Grelhada", description: "Com batata cozida e legumes", price: 22000 },
  ] },
  { id: "carne", title: "Sabores com presença", subtitle: "Carne", items: [
    { name: "Barriga de Porco na Brasa", description: "Com funge", price: 23500 },
    { name: "Bitoque de Novilho", price: 26000 },
    { name: "Frango da Guia", price: 17000 },
  ] },
  { id: "grelhados", title: "A simplicidade da brasa", subtitle: "Peixe para grelhar", items: [
    { name: "Garoupinha", price: 20000 },
    { name: "Cherne", price: 22000 },
    { name: "Linguado", price: 18000 },
    { name: "Salmão", price: 40000 },
    { name: "Robalo", description: "Aproximadamente 580 g", price: 40000 },
    { name: "Dourada", description: "Aproximadamente 470 g", price: 40000 },
    { name: "Choco", price: 20000 },
    { name: "Pregado", price: 100000, unit: "/ kg" },
  ] },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(price) + " Kz";
}
