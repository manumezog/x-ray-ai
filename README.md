# XRay Insights

This is a web application built with Next.js and Firebase that provides AI-powered analysis of X-ray images.

## Features

*   **User Authentication**: Secure user registration and login using Firebase Authentication.
*   **Email Allowlist**: Control which users can register and log in by managing an email allowlist in Firestore.
*   **X-Ray Image Upload**: Users can upload X-ray images (PNG, JPG, etc.) for analysis.
*   **AI-Powered Diagnostics**: Utilizes a generative AI model to analyze the uploaded image and generate a detailed diagnostic report.
*   **Multi-language Support**: The interface and reports can be switched between English and Spanish.
*   **PDF Export**: Users can download the generated diagnostic report as a professionally formatted PDF document.

## Tech Stack

*   **Framework**: Next.js (with App Router)
*   **Styling**: Tailwind CSS & shadcn/ui
*   **Authentication**: Firebase Authentication
*   **Database**: Firestore (for user profiles and allowlist)
*   **Generative AI**: Genkit with Google AI models

To get started with the code, take a look at `src/app/dashboard/page.tsx`.

## Managing the Email Allowlist

To control who can sign up for and log in to the application, you need to manage the `allowed_emails` collection in your Firestore database.

You can do this in two ways:

### 1. Manually via the Firebase Console

This is the simplest method for managing a small number of users.

1.  **Go to the Firebase Console**: Open your web browser and navigate to the [Firebase Console](https://console.firebase.google.com/).
2.  **Select Your Project**.
3.  **Navigate to Firestore**: In the left-hand menu under "Build", click on **Firestore Database**.
4.  **Manage the `allowed_emails` collection**:
    *   **To ADD an authorized email**: Click **"+ Add document"**, and for the "Document ID", enter the full email address (e.g., `test@example.com`). You can leave the fields empty.
    *   **To REMOVE an authorized email**: Click the three-dot menu next to the document for that email and select **"Delete document"**.

### 2. Programmatically via a Seeding Script

For managing a larger list of emails or for initial setup, you can use the provided seeding script.

1.  **Update the Script**: Open the `scripts/seed-allowlist.js` file and replace the example emails in the `emailsToAllow` array with your desired list.
2.  **Set Up Service Account Credentials**:
    *   In the Firebase Console, go to **Project settings** (click the gear icon) > **Service accounts**.
    *   Click **"Generate new private key"** and save the downloaded JSON file.
    *   **IMPORTANT**: Rename this file to `service-account.json` and place it in the root directory of your project. **This file is included in `.gitignore` and must never be committed to your repository.**
3.  **Run the script**:
    ```bash
    npm run seed:allowlist
    ```
This will add all the emails from the `emailsToAllow` array to your Firestore database.
