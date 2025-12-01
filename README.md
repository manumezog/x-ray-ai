# XRay Insights - AI Medical Imaging Analysis

XRay Insights is a web application that leverages generative AI to analyze uploaded X-ray images and produce detailed diagnostic reports. It provides a user-friendly interface for medical professionals and students to get quick, AI-powered insights from medical imaging.

## ✨ Features

- **Secure User Authentication**: Sign up and log in using Email & Password or Google Sign-In. User data is securely managed with Firebase Authentication.
- **X-Ray Image Upload**: Easily upload X-ray images through a drag-and-drop interface or a file selector.
- **AI-Powered Diagnostics**: Utilizes Google's Gemini model via Genkit to analyze images and generate structured, multi-section diagnostic reports.
- **Bilingual Interface**: The entire user interface can be switched between English (EN) and Spanish (ES).
- **Downloadable Reports**: Download the generated diagnostic reports as formatted PDF files for offline use or record-keeping.
- **Protected Routes**: The main dashboard is a protected route, accessible only to authenticated users.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) for components.
- **Authentication & Database**: [Firebase](https://firebase.google.com/) (Auth and Firestore)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini model.
- **Deployment**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## 📂 Code Structure

The project follows a structure conventional for Next.js applications, organizing files by feature and type.

```
.
├── src
│   ├── app                 # Next.js App Router pages and layouts
│   │   ├── dashboard       # Protected dashboard page and layout
│   │   ├── login           # Login page
│   │   └── signup          # Signup page
│   │
│   ├── ai                  # Genkit AI configuration and flows
│   │   ├── flows           # AI prompts and business logic
│   │   └── genkit.ts       # Genkit initialization
│   │
│   ├── components          # Reusable React components
│   │   ├── dashboard       # Components used specifically in the dashboard
│   │   └── ui              # Generic UI components from ShadCN
│   │
│   ├── context             # React Context providers (e.g., LanguageContext)
│   │
│   ├── firebase            # Firebase configuration, providers, and hooks
│   │   ├── firestore       # Custom hooks for Firestore
│   │   └── ...
│   │
│   ├── hooks               # Custom React hooks (e.g., useToast)
│   │
│   └── lib                 # Utility functions and type definitions
│
├── docs
│   └── backend.json        # Data model schema for Firestore
│
├── .env.example            # Template for required environment variables
├── firestore.rules         # Security rules for the Firestore database
└── next.config.ts          # Next.js configuration
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- A [Firebase Project](https://console.firebase.google.com/) with **Authentication** (Email/Password and Google providers enabled) and **Firestore** enabled.
- A **Google AI API Key** with access to the Gemini model. You can get this from [Google AI Studio](https://ai.google.dev/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a file named `.env` in the root of the project by copying the example file:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and add your credentials from Firebase and Google AI Studio.

      ```env
      # Firebase Configuration
      NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
      NEXT_PUBLIC_FIREBASE_APP_ID=1:123...

      # Google GenAI/Gemini Configuration
      GEMINI_API_KEY=AIza...
      ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running locally at `http://localhost:3000`.

### Building for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

You can then start the production server with:

```bash
npm start
```
