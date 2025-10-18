# NFL Stats Radar

A website for visualizing NFL player statistics. The main feature of this web app is the ability to view the statistical profiles of all QBs, RBs, WRs, and TEs since 1999. The app is built using Next.js and Typescript. The backend consists of a simple SQLite DB that is made up of data from NFLverse's data repository (see References section for more info). I currently have the app deployed using Railway.

**Official Website**: [https://nfl-stats-radar.com/](https://nfl-stats-radar.com/)

## Current Features
- Search for any NFL player (QB/RB/WR/TE) who has played since 1999
- Player profiles with rankings in key statistics
- Player comparison page
- Visualizations:
  - Charts showing how a player's stats compare to the rest of the league
  - Percentile sliders for easy visual comparison (similar to Baseball Savant)

## Future Features + Plans
- Real-time customizable visualizations
- Pass + Catch map visualizations for QBs and WRs
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
git lfs install # Install Git LFS on your system first
```
*Note: The reason I store the DB directly in the repo and use Git LFS is because the DB is read-only and contains purely NFL statistics and so I don't need a particularly complex DB hosting solution. Just one that can support a file larger than 100MB* 


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
