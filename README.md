# NFL Stats Radar

A website for visualizing NFL player statistics. The main feature of this web app is the ability to view the statistical profiles of all QBs, RBs, WRs, and TEs since 1999. The app is built using Next.js and Typescript. The backend consists of a simple SQLite DB that is made up of data from NFLverse's data repository (see References section for more info). I currently have the app deployed using Railway.

**Official Website**: [https://nfl-stats-radar.com/](https://nfl-stats-radar.com/)

## Current Features
- Weekly Power Rankings
- Search for any NFL player (QB/RB/WR/TE) who has played since 1999
- Player profiles with rankings in key statistics
- Player comparison page
- Visualizations:
  - Charts showing how a player's stats compare to the rest of the league
  - Percentile sliders for easy visual comparison (similar to Baseball Savant)
  - Pass map visualizations for QBs (2010 - present)

## Future Features + Plans
- Live game scores and statistics
- Catch map visualizations for WRs
- Player radar charts (i.e. something similar to the classic attribute radar charts in FIFA)
- Integration with a game simulation model

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nishs9/nfl-stats-radar.git
cd nfl-stats-radar
```
*Note: I access the DB via a Cloudflare R2 bucket. You can generate the DB yourself via the setup script in the db folder and tweak the access logic within db.ts and initDb.ts based on your own implementation.* 


2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

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
