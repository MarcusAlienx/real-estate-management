// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api: {
    server: 'http://localhost:8000/',
    // TODO: Obtain mapKey from Stadia Maps (https://stadiamaps.com/) - Sign up, create API key, and insert here
    mapKey: '746ebb2b-f22f-48c9-b6b4-b7826f4a18eb', // Insert your Stadia Maps API key here (alternative: OpenStreetMap tiles don't require API key)
    // TODO: Obtain googleAuthClientId from Google Cloud Console (https://console.cloud.google.com/) - Create OAuth 2.0 credentials
    googleAuthClientId: '951713624352-2na2q3lnkgs85eatub1cojjt45lf9c28.apps.googleusercontent.com', // Insert your Google OAuth 2.0 Client ID here
    webSocketUrl: 'ws://localhost:8000/websocket',
  },
  map: {
    // Add the map tiles to show base on theme
    tiles: {
      default:
        'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=',
      dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=',
    },
  },
  features: {
    restrictedMode: false,
    restrictedHeading: 'Restricted',
    restrictedMessage: 'This feature is currently disabled in this mode.',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
