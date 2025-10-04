export const environment = {
  production: true,
  api: {
    server: 'https://metroland.mx/',
    mapKey: process.env['STADIA_MAPS_API_KEY'] || '',
    googleAuthClientId: '951713624352-2na2q3lnkgs85eatub1cojjt45lf9c28.apps.googleusercontent.com',
    webSocketUrl: 'wss://metroland.mx/websocket',
  },
  map: {
    tiles: {
      default: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=',
      dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=',
    },
  },
  features: {
    restrictedMode: false,
    restrictedHeading: 'Restricted',
    restrictedMessage: 'This feature is currently disabled in this mode.',
  },
};
