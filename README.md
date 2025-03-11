# SatelliteApp

SatelliteApp is a tool designed to track satellites using data from CelesTrak and Space Track API. This application allows users to monitor satellite positions and movements in real-time.

## Prerequisites

- Ensure you have a Space Track account. You can create one at [Space Track](https://www.space-track.org/).
- Clone the repository from [satellite-tracker](https://github.com/dsuarezv/satellite-tracker) which was used as a reference for this project.

## Setup

1. Clone the SatelliteApp repository:
    ```sh
    git clone https://github.com/yourusername/SatelliteApp.git
    cd SatelliteApp
    ```

2. Install the required dependencies:
    ```sh
    npm install
    ```

3. Configure your Space Track credentials:
    - Open the `space-track-api.js` file in the root directory.
        - Replace the placeholder strings with your Space Track username and password:
            ```js
            const username = 'your_username';
            const password = 'your_password';
            ```

## Running the Application

1. Start the Space Track API in a separate terminal:
    ```sh
    node space-track-api.js
    ```

2. Run the SatelliteApp:
    ```sh
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- Use the interface to search for satellites and view their current positions.
- Monitor the real-time movement of satellites on the map.
- Filter satellites by different categories:
    - Active
    - Geostationary
    - Starlink
    - Debris
    - All

## Acknowledgements

This project was inspired by and references code from the [satellite-tracker](https://github.com/dsuarezv/satellite-tracker) repository.