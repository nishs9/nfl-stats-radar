FROM node:22.14-alpine

WORKDIR /app

# Add build tools needed for native modules like sqlite3
RUN apk add --no-cache python3 make g++ git git-lfs

RUN git lfs install --skip-repo

COPY .git .git
COPY .gitattributes .gitattributes
RUN git lfs fetch
RUN git lfs checkout

# Install dependencies first *inside the container*
COPY package.json package-lock.json* ./
# npm ci should now be able to build sqlite3 correctly for Alpine
RUN npm ci --verbose 

# Copy the rest of the application code
COPY . .

# List files for debugging (optional)
RUN ls -la
RUN ls -lah db/
RUN head -c 100 db/nfl_stats.db || echo "DB file issue"

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start", "--", "-p", "8080"]
