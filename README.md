# NFL Stats Radar

A project for visualizing NFL player statistics. The main feature of this web app is the ability to view the statistical profiles of all QBs, RBs, WRs, and TEs since 1999. The app is built using Next.js and Typescript. The backend consists of a simple SQLite DB that is made up of data from NFLverse's data repository (see References section for more info). I currently have the app deployed as a live demo using Railway.

**Live Demo**: [https://nfl-stats-radar-production.up.railway.app/](https://nfl-stats-radar-production.up.railway.app/)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/nfl-stats-radar.git
cd nfl-stats-radar
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database:
```bash
# The database will be automatically initialized on first run
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Docker Support

The project also includes Docker support for containerized development and deployment:

1. Build the Docker image:
```bash
docker build -t nfl-stats-radar .
```

2. Run the container:
```bash
docker run -p 8080:8080 nfl-stats-radar
```

## License

MIT

## References
The data that NFL Stats Radar relies on comes from a public repo provided by nflverse. I use the player season stats data specifically for this project but the repo has even more detailed data from current and past seasons. All of this data can be accessed and downloaded from [here](https://github.com/nflverse/nflverse-data/releases).

Here is a link to nflverse's main GitHub page as well: https://github.com/nflverse