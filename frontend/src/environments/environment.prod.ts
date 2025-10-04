export const environment = {
  production: true,
  api: {
    server: 'https://api.metroland.com/',
    mapKey: '',
    googleAuthClientId: '',
    webSocketUrl: 'wss://api.metroland.com/websocket',
  },
  map: {
    tiles: {
      default: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      dark: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
  },
  features: {
    restrictedMode: false,
    restrictedHeading: 'Restricted',
    restrictedMessage: 'This feature is currently disabled in this mode.',
  },
};
