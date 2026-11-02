# Use a lightweight Debian-based Node image
# We use bookworm-slim instead of alpine because installing TeX Live (for xelatex) is much more stable on Debian.
FROM node:20-bookworm-slim

# Install system dependencies for LaTeX (specifically xelatex)
# - texlive-xetex: Provides the `xelatex` command you use in resumeService.js
# - texlive-latex-extra: Provides common LaTeX packages that resumes usually need
# - texlive-fonts-recommended & fontconfig: Essential for font rendering in PDFs
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-xetex \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (this helps Docker cache the npm install step)
COPY package*.json ./

ENV NODE_ENV=production

# Install Node.js dependencies (production only, from the lockfile)
RUN npm ci --omit=dev

# Copy the rest of the backend source code
COPY . .

# Run as the unprivileged "node" user; compile jobs write to os.tmpdir()
USER node

# Expose the port the Express app runs on
EXPOSE 7000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||7000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start the Node.js application
CMD ["npm", "start"]
