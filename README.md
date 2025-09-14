# Mirror ✨

"Mirror" is a revolutionary minimal site builder that brings your development environment directly into the browser! 🚀 Craft beautiful websites with an integrated code editor, live preview, and AI assistance, all without any local setup. ✨

## Key Features

*   **In-Browser Development Environment**: 🖥️ Spin up full coding projects directly in your browser using cutting-edge WebContainer technology – no local dependencies or installations required!
*   **Intuitive Code Editor & Project Management**: ✍️ Edit, organize, and manage your files within a powerful, integrated editor. Start new projects or seamlessly resume existing ones, with your progress always saved.
*   **Secure User Authentication**: 🔐 Log in effortlessly with Google OAuth. Manage your sessions and access personalized project spaces.
*   **AI-Assisted Development**: 🤖 Boost your productivity with intelligent AI assistance. Generate code, get suggestions, and interact with your project through a built-in chat interface.
*   **Cloud Asset Management**: ☁️ Easily upload and manage your site's images and media files with integrated Cloudinary support.
*   **Live Preview Capability**: 👀 See your changes instantly with a real-time live preview of your website as you code.

## Technologies Used

### Backend / Fullstack

*   [Next.js](https://nextjs.org/) (App Router)
*   [NextAuth.js](https://next-auth.js.org/) (Google OAuth)
*   [WebContainer](https://webcontainers.io/) (for in-browser sandboxing)
*   [Cloudinary](https://cloudinary.com/) (Asset Management)

### Frontend

*   [React](https://react.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [react-hot-toast](https://react-hot-toast.com/) (Notifications)

## Getting Started

Follow these steps to get "Mirror" up and running on your local machine for development and testing purposes.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mirror.git
    cd mirror
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root of your project. You will need to define the following environment variables (refer to the provided `.env.example` for structure and guidance):
    *   `NEXTAUTH_SECRET`
    *   `GOOGLE_CLIENT_ID`
    *   `GOOGLE_CLIENT_SECRET`
    *   `CLOUDINARY_CLOUD_NAME`
    *   `CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`

    Obtain your Google OAuth credentials from the Google Cloud Console and your Cloudinary credentials from your Cloudinary dashboard. `NEXTAUTH_SECRET` can be a randomly generated string.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or yarn dev
    # or pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.