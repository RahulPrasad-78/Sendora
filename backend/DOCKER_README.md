# Dockerizing Sendora Backend (LaTeX Support)

This guide explains how and why this backend was Dockerized, and everything you need to know before deploying it.

## Why Docker? (The Vercel Limitation)
Vercel is an amazing platform for serverless functions, but it has a strict size limit and **does not support installing large system-level libraries** like TeX Live (`xelatex`). Because your backend generates PDFs from LaTeX (`resumeService.js` calls `xelatex --version`), deploying to a standard Vercel environment will crash when it tries to compile the resume.

**The Solution:** Docker allows us to create a custom server environment that includes both Node.js AND the required Linux LaTeX dependencies. 

## What IS Dockerized?
Inside the `Dockerfile`, we are packaging:
1. **The Operating System:** A lightweight Debian Linux environment (`node:20-bookworm-slim`).
2. **System Dependencies (LaTeX):** We run `apt-get install` to install `texlive-xetex` (which gives you the `xelatex` command), `texlive-latex-extra`, and font packages.
3. **Your App Code:** All your controllers, services, models, routes, and `server.js`.
4. **Node Dependencies:** Docker runs `npm install` inside the container to generate a fresh, Linux-compatible `node_modules` folder.

## What is NOT Dockerized?
We created a `.dockerignore` file to ensure the following are left *out* of the image:
1. **`node_modules/`:** We don't copy your local Windows `node_modules` because Linux needs its own compiled versions of packages. Docker installs them fresh.
2. **`.env`:** Never bake secrets into a Docker image! If your image gets leaked, your database and API keys would be stolen. Environment variables are injected by your cloud provider at runtime.
3. **`.git/`:** Saves space by not including version control history.

## How to Test it Locally

Once you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on Windows, open a terminal in this `backend` folder and run:

### 1. Build the Image
This tells Docker to read the `Dockerfile` and build your environment. (Note: The first time you run this, it will take a few minutes because downloading LaTeX is a bit heavy).
```powershell
docker build -t sendora-backend .
```

### 2. Run the Container
This runs your newly built image. Notice how we pass `--env-file .env`. This tells Docker to take your local secrets and inject them into the running container safely.
```powershell
docker run -p 7000:7000 --env-file .env sendora-backend
```

## How to Deploy to the Cloud
Since you cannot use Vercel for this Dockerized backend, you will need a platform that supports Docker containers. Great alternatives include:
*   **Google Cloud Run (Recommended):** Serverless, scales to 0, very cheap.
*   **Render (Web Service):** Easiest alternative to Vercel. Select "Deploy from Docker" instead of Node.
*   **Railway.app:** Very developer-friendly Docker deployment.
*   **DigitalOcean App Platform:** Great predictable pricing.

**Deployment Steps:**
1. Push your code to GitHub.
2. Connect your GitHub repository to Render / Railway / Google Cloud Run.
3. The platform will automatically detect the `Dockerfile` and build it.
4. Go to the "Environment Variables" tab in your cloud dashboard and copy/paste everything from your local `.env` file.
