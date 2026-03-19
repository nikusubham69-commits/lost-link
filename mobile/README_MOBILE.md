# Lost-Link Mobile App

This is the mobile version of the Lost-Link web application, built using Expo and React Native.

## Setup

1.  **Install dependencies**:
    ```bash
    cd mobile
    npm install
    ```

2.  **Configure API**:
    Open `src/api/api.ts` and change `API_BASE_URL` to your machine's local IP address (e.g., `http://192.168.1.5:5000/api`).
    If you are using an Android Emulator, `http://10.0.2.2:5000/api` should work.

3.  **Run the app**:
    ```bash
    npx expo start
    ```
    Scan the QR code with the Expo Go app on your phone.

## Building the APK

To generate an APK file that you can share with your friends:

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    eas login
    ```

3.  **Configure Build**:
    ```bash
    eas build:configure
    ```

4.3.  **Build for Android (APK)**:
    ```bash
    eas build --platform android --profile preview
    ```
    *Note: The `preview` profile should be configured in `eas.json` to produce an APK instead of an AAB. If the build fails, try adding `EAS_SKIP_AUTO_FINGERPRINT=1` before the command.*

## Features Ported
- User Authentication (Login/Register)
- Item Feed (Lost & Found items)
- Report New Item (with Camera & Location)
- Real-time Chat (Socket.io)
- Profile Management
- Item Details with Map view
