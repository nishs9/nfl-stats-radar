FROM node:22.14-alpine

WORKDIR /app

# Add build tools needed for native modules like sqlite3
RUN apk add --no-cache python3 make g++

# Install dependencies first *inside the container*
COPY package.json package-lock.json* ./
# npm ci should now be able to build sqlite3 correctly for Alpine
RUN npm ci --verbose 

# Copy the rest of the application code
COPY . .

# List files for debugging (optional)
RUN ls -la
RUN ls -la db/

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start", "--", "-p", "8080"]
