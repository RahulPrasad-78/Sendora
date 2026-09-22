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
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (this helps Docker cache the npm install step)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port the Express app runs on
EXPOSE 7000

# Start the Node.js application
CMD ["npm", "start"]
