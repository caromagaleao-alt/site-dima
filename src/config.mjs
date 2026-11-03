// Dados gerais do site.
export default {
  url: 'https://dimadistribuidora.com.br',
  telefone: '+55-31-99127-8633',
  whatsapp: 'https://wa.me/5531991278633',
  email: 'comercial@dimadistribuidora.com.br',
  redes: [
    'https://www.instagram.com/dimalimpeza.pro/',
    'https://www.youtube.com/@DicasdaCarol',
    'https://www.linkedin.com/company/dima-distribuidora-de-materiais-de-limpeza/',
  ],
  // Área atendida: vai só para os dados lidos pelo Google (não aparece no texto do site).
  // Região metropolitana de BH, num raio de 80 km a partir do centro de Belo Horizonte.
  areaAtendida: [
    { '@type': 'AdministrativeArea', name: 'Região Metropolitana de Belo Horizonte' },
    {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: -19.9191, longitude: -43.9386 },
      geoRadius: '80000',
    },
  ],
};
