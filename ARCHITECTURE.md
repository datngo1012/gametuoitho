# Game Pages Architecture

## 🏗️ System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User visits game page                    │
│              (e.g., /diamond-rush.html)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              loadGamesFromJson() executed                    │
│     Detects current path from window.location.pathname      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Check against gamePageMap object                   │
│   {                                                          │
│     'diamond-rush': 'DiamondRush',                          │
│     'disco': 'Disco',                                       │
│     'ninja-school-2': 'NinjaSchool2',                       │
│     ...                                                      │
│   }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
    ✅ Match found              ❌ No match found
          │                             │
          ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Filter games list to │      │ Return full games    │
│ single game by ID    │      │ list (homepage)      │
└──────────┬───────────┘      └──────────┬───────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │    loadGames() processes    │
            │   and installs if needed    │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │      reloadUI() sorts       │
            │  games into pre-installed   │
            │     vs uploaded arrays      │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │   fillGamesList() renders   │
            │   - Adds single-game class  │
            │   - Hides search if needed  │
            │   - Centers game display    │
            └─────────────────────────────┘
```

## 🎯 URL Mapping Strategy

```
URL Pattern           →   Page Slug        →   Game ID
───────────────────────────────────────────────────────────────
/diamond-rush.html    →   diamond-rush     →   DiamondRush
/disco.html           →   disco            →   Disco
/ninja-school-2.html  →   ninja-school-2   →   NinjaSchool2
/worms.html           →   worms            →   Worms
...                   →   ...              →   ...
```

## 🎨 CSS Class Application

```
Number of Games    →   CSS Class       →   Effect
─────────────────────────────────────────────────────────────
1 game             →   .single-game    →   Center display
                   →                   →   Hide search
2+ games           →   (none)          →   Grid layout
                   →                   →   Show search
```

## 🗂️ File Structure

```
freej2me-web/
├── web/
│   ├── src/
│   │   └── launcher.js          ← Main logic with gamePageMap
│   ├── games/
│   │   └── list.json            ← Game definitions with IDs
│   ├── sitemap.xml              ← SEO sitemap (updated)
│   ├── index.html               ← Homepage (all games)
│   ├── diamond-rush.html        ← Single game page
│   ├── disco.html               ← Single game page
│   ├── ninja-school-2.html      ← Single game page
│   └── ... (other game pages)
└── GAME_PAGES_UPDATE.md         ← This documentation
```

## 📊 Data Flow

```
list.json
    │
    ├─→ Game Object {
    │       id: "DiamondRush",
    │       filename: "DiamondRush_240x320.jar",
    │       name: "Diamond Rush",
    │       settings: {...},
    │       description: "...",
    │       gameplay: "...",
    │       tags: [...]
    │   }
    │
    ▼
loadGamesFromJson()
    │
    ├─→ Filter by page context
    │   (using gamePageMap)
    │
    ▼
installGameFromJson()
    │
    ├─→ Load JAR file
    ├─→ Create MIDletLoader
    ├─→ Process game data
    ├─→ Save to IndexedDB
    │
    ▼
Game State {
    appId: "DiamondRush",
    name: "Diamond Rush",
    icon: "data:image/...",
    settings: {...},
    gameInfo: {...}
}
    │
    ▼
renderGames()
    │
    ├─→ Create game-item div
    ├─→ Add icon, name, tags
    ├─→ Add description, gameplay
    ├─→ Add metadata (genre, year, rating)
    │
    ▼
DOM Element displayed on page
```

## 🔄 State Management

```
Application State:
─────────────────────────────────────────────
state = {
    games: [],              ← Pre-installed games
    uploadedGames: [],      ← User-uploaded games  
    currentGame: null,      ← Currently editing
    editedGameId: null,
    uploadedJars: 0,
    lastLoader: null
}

Window State:
─────────────────────────────────────────────
window.currentGames      ← For re-rendering
window.uploadedGames     ← For re-rendering
```

## 🎭 Game Page Rendering Logic

```javascript
// Pseudocode
function renderGamePage(url) {
    pageSlug = extractSlugFromURL(url);
    
    if (pageSlug in gamePageMap) {
        gameId = gamePageMap[pageSlug];
        filteredGames = filterGamesById(gameId);
        
        if (filteredGames.length === 1) {
            applyClass('single-game');
            hideSearch();
            centerDisplay();
        }
        
        renderGames(filteredGames);
    } else {
        // Homepage
        renderAllGames();
        showSearch();
    }
}
```

## 🔍 Search Visibility Logic

```
┌─────────────────────────────┐
│  Check games.length         │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
games.length = 1  games.length > 1
    │             │
    ▼             ▼
Hide search   Show search
```

## 📱 Responsive Behavior

```
Mobile (< 768px):
────────────────────────────────────
┌──────────────────────────────┐
│                              │
│      [Game Card - 100%]      │
│                              │
└──────────────────────────────┘

Desktop (≥ 768px):
────────────────────────────────────
        ┌──────────────┐
        │  Game Card   │
        │  (centered)  │
        └──────────────┘
```

## 🎯 Future Architecture

```
Proposed: Auto-generate game pages
──────────────────────────────────────────────

Python Script (create_game_pages.py)
    │
    ├─→ Read list.json
    ├─→ For each game:
    │   ├─→ Generate HTML from template
    │   ├─→ Add to sitemap.xml
    │   └─→ Add meta tags (SEO)
    │
    └─→ Output: 17 HTML files

Benefits:
✓ Single source of truth (list.json)
✓ Consistent structure
✓ Easy to update all pages
✓ Automatic sitemap generation
✓ SEO optimization
