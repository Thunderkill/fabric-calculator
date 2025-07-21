# Fabric Calculator

This project is a web-based fabric calculator application built with React, TypeScript, and Vite. It helps users calculate fabric requirements based on their input.

## Features

*   **Interactive UI:** User-friendly interface for inputting dimensions and viewing results.
*   **Real-time Calculations:** Provides instant feedback as inputs are changed.
*   **Responsive Design:** Works well on various screen sizes.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **Docker:** For containerization, ensuring consistent environments across development and deployment.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

Make sure you have the following installed:

*   Node.js (LTS version recommended)
*   npm or yarn
*   Docker (if you plan to use Docker for development)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/thunderkill/fabric-calculator.git
    cd fabric-calculator
    ```

2.  Install NPM packages:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

### Running Locally

#### Using NPM/Yarn

```bash
npm run dev
```
or
```bash
yarn dev
```

This will start the development server, and you can access the application at `http://localhost:5173` (or another port if 5173 is in use).

#### Using Docker

1.  Build the Docker image:
    ```bash
    docker-compose build
    ```

2.  Run the Docker container:
    ```bash
    docker-compose up
    ```

This will start the application in a Docker container, accessible at `http://localhost:5173`.

## Project Structure

*   `src/`: Contains the main application source code.
    *   `src/App.tsx`: Main application component.
    *   `src/main.tsx`: Entry point of the React application.
    *   `src/components/FabricCalculator.tsx`: The core component for fabric calculations.
*   `public/`: Static assets.
*   `Dockerfile`: Dockerfile for building the application image.
*   `docker-compose.yml`: Docker Compose file for multi-container Docker applications.
*   `package.json`: Project dependencies and scripts.
*   `vite.config.ts`: Vite configuration.
*   `tsconfig.json`: TypeScript configuration.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - your_email@example.com
Project Link: [https://github.com/thunderkill/fabric-calculator](https://github.com/thunderkill/fabric-calculator)
