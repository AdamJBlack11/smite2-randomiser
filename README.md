# Smite 2 Randomiser

A web-based randomiser for Smite 2 gods and item builds. Hosted on GitHub Pages.

**Live Site:** https://adamjblack11.github.io/smite2-randomiser/

## Features

- **God Randomiser** - Random god selection with filters for class, pantheon, and damage type
- **God Selector** - Search and select a specific god, then randomise only the build
- **Build Generator** - Generates 6 random T3 items appropriate for the god's damage type
- **Starter Item** - Random starter item matching god's damage type (Guardians also get support starters)
- **Relic** - Random base relic (Smite 2 has 1 relic per match, not 2)
- **Reroll System** - Configurable number of rerolls for individual items

## File Structure

```
Smite 2 Randomiser/
├── index.html          # Main HTML structure
├── css/style.css       # All styling (dark theme)
├── js/app.js           # All application logic
└── data/
    ├── gods.json       # 75 gods with class, pantheon, damageType
    └── items.json      # Starters, T3 items, relics
```

## Data Structure

### gods.json
```json
{
  "gods": [
    {"name": "Achilles", "pantheon": "Greek", "class": "Warrior", "damageType": "Physical", "image": "achilles.webp"}
  ],
  "classes": ["Assassin", "Guardian", "Hunter", "Mage", "Warrior"],
  "pantheons": ["Arthurian", "Celtic", "Chinese", ...],
  "damageTypes": ["Physical", "Magical"]
}
```

### items.json
```json
{
  "starters": {
    "physical": [...],    // For physical gods
    "magical": [...],     // For magical gods
    "support": [...]      // Added to Guardians' pool
  },
  "tier3": {
    "physicalOffensive": [...],  // Physical gods only
    "magicalOffensive": [...],   // Magical gods only
    "defense": [...],            // Both damage types
    "hybrid": [...]              // Both damage types
  },
  "relics": [...],               // 6 base relics (free at match start)
  "relicUpgrades": [...]         // 6 upgraded relics (purchasable items in builds)
}
```

## Key Code Logic

### Item Assignment by Damage Type (js/app.js)
- `getItemsForGod(god)` - Returns appropriate item pools based on god's damage type
- Physical gods: physicalOffensive + defense + hybrid + relicUpgrades
- Magical gods: magicalOffensive + defense + hybrid + relicUpgrades

### Image URLs
- **God images:** SmiteSource CDN (`smite-images.appz.sh`)
- **Item images:** Smite 2 Wiki (`wiki.smite2.com/images`)
- `ITEM_FILENAME_MAP` object handles special naming cases (apostrophes, hyphens, camelCase)

### Two Randomise Modes
1. **Randomise All** - Picks random god (respecting filters) + random build
2. **Randomise Build Only** - Uses manually selected god + random build

## Updating Data

### Adding a New God
Add to `data/gods.json`:
```json
{"name": "NewGod", "pantheon": "Greek", "class": "Mage", "damageType": "Magical", "image": "newgod.webp"}
```

If the god name has spaces or special characters, add to `getGodImageUrl()` nameMap in app.js.

### Adding a New Item
Add to appropriate category in `data/items.json`.

If the item name has apostrophes, hyphens, or unusual wiki naming, add to `ITEM_FILENAME_MAP` in app.js.

## Deployment

Site auto-deploys on push to master branch via GitHub Pages.

```bash
git add -A
git commit -m "Description of changes"
git push
```

Build status: `gh api repos/AdamJBlack11/smite2-randomiser/pages`

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no frameworks)
- Static JSON data files (no backend/API)
- GitHub Pages hosting
