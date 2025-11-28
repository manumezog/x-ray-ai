# XRay Insights

This is a web application built with Next.js and Firebase that provides AI-powered analysis of X-ray images.

## Features

*   **User Authentication**: Secure user registration and login using Firebase Authentication.
*   **X-Ray Image Upload**: Users can upload X-ray images (PNG, JPG, etc.) for analysis.
*   **AI-Powered Diagnostics**: Utilizes a generative AI model to analyze the uploaded image and generate a detailed diagnostic report.
*   **Multi-language Support**: The interface and reports can be switched between English and Spanish.
*   **PDF Export**: Users can download the generated diagnostic report as a professionally formatted PDF document.

## Tech Stack

*   **Framework**: Next.js (with App Router)
*   **Styling**: Tailwind CSS & shadcn/ui
*   **Authentication**: Firebase Authentication
*   **Database**: Firestore (for user profiles)
*   **Generative AI**: Genkit with Google AI models

To get started with the code, take a look at `src/app/dashboard/page.tsx`.
