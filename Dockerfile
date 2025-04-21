FROM node:22.14-alpine

WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json* ./
RUN npm ci --verbose

# Copy all application code, including the db directory with nfl_stats.db
COPY . .

# List files for debugging (optional)
RUN ls -la
RUN ls -la db/

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Set production environment
ENV NODE_ENV production
ENV PORT 8080

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start", "--", "-p", "8080"]
