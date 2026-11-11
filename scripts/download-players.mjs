import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const players = [
  { id: 'saka', title: 'Bukayo_Saka' },
  { id: 'ronaldo', title: 'Cristiano_Ronaldo' },
  { id: 'haaland', title: 'Erling_Haaland' },
  { id: 'bellingham', title: 'Jude_Bellingham' },
  { id: 'mbappe', title: 'Kylian_Mbapp%C3%A9' },
  { id: 'yamal', title: 'Lamine_Yamal' },
  { id: 'messi', title: 'Lionel_Messi' },
  { id: 'osimhen', title: 'Victor_Osimhen' },
  { id: 'vinicius', title: 'Vin%C3%ADcius_J%C3%BAnior' },
];

const titles = players.map(p => p.title).join('|');
const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${titles}&prop=pageimages&pithumbsize=500&format=json`;

const res = execSync(`curl.exe -s -A "FootballWearsStore/1.0 (contact: info@footballwears.com)" "${apiUrl}"`).toString();
const data = JSON.parse(res);
const pages = Object.values(data.query.pages);

const outDir = path.resolve('public/players');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const player of players) {
  const normTitle = decodeURIComponent(player.title).replace(/_/g, ' ');
  const page = pages.find(p => p.title.toLowerCase() === normTitle.toLowerCase() || p.title.includes(normTitle));
  if (page && page.thumbnail && page.thumbnail.source) {
    const imgUrl = page.thumbnail.source;
    const dest = path.join(outDir, `${player.id}.jpg`);
    console.log(`Downloading ${player.id} from ${imgUrl}...`);
    execSync(`curl.exe -s -L -A "FootballWearsStore/1.0" -o "${dest}" "${imgUrl}"`);
    console.log(`Saved ${dest}`);
  } else {
    console.warn(`No thumbnail found for ${player.id}`);
  }
}

