// Smite 2 Randomiser - Main Application

// Image Sources
const GOD_CDN = 'https://smite-images.appz.sh/cdn-cgi/image';
const WIKI_BASE = 'https://wiki.smite2.com/images';

// Generate God Image URL (using SmiteSource CDN - works well for gods)
function getGodImageUrl(godName) {
    const nameMap = {
        'Princess Bari': 'Bari',
        'The Morrigan': 'TheMorrigan',
        'Baron Samedi': 'BaronSamedi',
        'Da Ji': 'DaJi',
        'Guan Yu': 'GuanYu',
        'Hou Yi': 'HouYi',
        'Hua Mulan': 'HuaMulan',
        'Hun Batz': 'HunBatz',
        'Jing Wei': 'JingWei',
        'Nu Wa': 'NuWa',
        'Sun Wukong': 'SunWukong'
    };

    const cdnName = nameMap[godName] || godName.replace(/\s+/g, '');
    return `${GOD_CDN}/width=256,quality=75,format=auto/Gods/${cdnName}/Default/t_GodPortrait_${cdnName}.png`;
}

// Item name to wiki filename mapping for non-standard names
const ITEM_FILENAME_MAP = {
    // Items without underscores (camelCase in wiki)
    "Stygian Anchor": "StygianAnchor",
    // Items with specific casing
    "Mantle Of Discord": "Mantle_of_Discord",
    "Rod Of Asclepius": "Rod_of_Asclepius",
    "Bracer of The Abyss": "Bracer_of_The_Abyss",
    "Pendulum Of The Ages": "Pendulum_of_the_Ages",
    "Sands Of Time": "Sands_of_Time",
    // All items with apostrophes (wiki preserves apostrophes)
    "Avatar's Parashu": "Avatar's_Parashu",
    "Bancroft's Talon": "Bancroft's_Talon",
    "Berserker's Shield": "Berserker's_Shield",
    "Bragi's Harp": "Bragi's_Harp",
    "Brawler's Beat Stick": "Brawler's_Beat_Stick",
    "Bumba's Cudgel": "Bumba's_Cudgel",
    "Bumba's Golden Dagger": "Bumba's_Golden_Dagger",
    "Bumba's Hammer": "Bumba's_Hammer",
    "Bumba's Spear": "Bumba's_Spear",
    "Chandra's Grace": "Chandra's_Grace",
    "Chronos' Pendant": "Chronos'_Pendant",
    "Circe's Hexstone": "Circe's_Hexstone",
    "Devourer's Gauntlet": "Devourer's_Gauntlet",
    "Dreamer's Idol": "Dreamer's_Idol",
    "Eros' Bow": "Eros'_Bow",
    "Freya's Tears": "Freya's_Tears",
    "Genji's Guard": "Genji's_Guard",
    "Gladiator's Shield": "Gladiator's_Shield",
    "Hussar's Wings": "Hussar's_Wings",
    "Hydra's Lament": "Hydra's_Lament",
    "Jotunn's Revenge": "Jotunn's_Revenge",
    "Leviathan's Hide": "Leviathan's_Hide",
    "Magi's Cloak": "Magi's_Cloak",
    "Musashi's Dual Swords": "Musashi's_Dual_Swords",
    "Odysseus' Bow": "Odysseus'_Bow",
    "Oni Hunter's Garb": "Oni_Hunter's_Garb",
    "Pharaoh's Curse": "Pharaoh's_Curse",
    "Qin's Blade": "Qin's_Blade",
    "Ragnarok's Wake": "Ragnarok's_Wake",
    "Shifter's Shield": "Shifter's_Shield",
    "Shogun's Ofuda": "Shogun's_Ofuda",
    "Titan's Bane": "Titan's_Bane",
    "Triton's Conch": "Triton's_Conch",
    "Typhon's Heart": "Typhon's_Heart",
    "Yogi's Necklace": "Yogi's_Necklace",
    // Starters with apostrophes
    "Archmage's Gem": "Archmage's_Gem",
    "Death's Embrace": "Death's_Embrace",
    "Death's Toll": "Death's_Toll",
    "Hunter's Cowl": "Hunter's_Cowl",
    "Sharpshooter's Arrow": "Sharpshooter's_Arrow",
    "Warrior's Axe": "Warrior's_Axe",
    // Upgraded relics
    "Time-lock Aegis": "Time-lock_Aegis"
};

// Generate Item Image URL (using Smite 2 Wiki)
function getItemImageUrl(itemName, itemType = 'T3', itemTier = null) {
    // Check for mapped filename first, otherwise convert name
    let wikiName = ITEM_FILENAME_MAP[itemName];

    if (!wikiName) {
        // Default conversion: replace spaces with underscores, convert "Of" to "of"
        wikiName = itemName
            .replace(/\s+/g, '_')
            .replace(/_Of_/g, '_of_')
            .replace(/_The_/g, '_the_');
    }

    if (itemType === 'Starter') {
        const t2Starters = [
            "Bluestone Brooch", "Archmage's Gem", "Death's Embrace",
            "Hunter's Cowl", "Bumba's Hammer", "Bumba's Spear",
            "Pendulum Of The Ages", "War Banner", "Sharpshooter's Arrow",
            "Heroism", "Sundering Axe", "Blood-soaked Shroud"
        ];
        const tier = itemTier || (t2Starters.includes(itemName) ? 'T2' : 'T1');
        return `${WIKI_BASE}/Starter_${tier}_${wikiName}.png`;
    } else if (itemType === 'Relic') {
        return `${WIKI_BASE}/Relic_${wikiName}.png`;
    } else {
        return `${WIKI_BASE}/T3_${wikiName}.png`;
    }
}

// State
let godsData = null;
let itemsData = null;
let currentFilters = {
    class: 'all',
    pantheon: 'all',
    damageType: 'all'
};
let currentResult = {
    god: null,
    starter: null,
    items: [],
    relic: null
};
let rerollsRemaining = 3;

// DOM Elements
const classFilters = document.getElementById('classFilters');
const pantheonFilters = document.getElementById('pantheonFilters');
const damageFilters = document.getElementById('damageFilters');
const randomiseBtn = document.getElementById('randomiseBtn');
const resultsSection = document.getElementById('results');
const includeStarterCheckbox = document.getElementById('includeStarter');
const includeRelicsCheckbox = document.getElementById('includeRelics');
const rerollCountInput = document.getElementById('rerollCount');

// Load Data
async function loadData() {
    try {
        const [godsResponse, itemsResponse] = await Promise.all([
            fetch('data/gods.json'),
            fetch('data/items.json')
        ]);
        godsData = await godsResponse.json();
        itemsData = await itemsResponse.json();
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load game data. Please refresh the page.');
    }
}

// Filter Handlers
function setupFilterHandlers() {
    // Class filters
    classFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            updateFilterSelection(classFilters, e.target);
            currentFilters.class = e.target.dataset.filter;
        }
    });

    // Pantheon filters
    pantheonFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            updateFilterSelection(pantheonFilters, e.target);
            currentFilters.pantheon = e.target.dataset.filter;
        }
    });

    // Damage type filters
    damageFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            updateFilterSelection(damageFilters, e.target);
            currentFilters.damageType = e.target.dataset.filter;
        }
    });
}

function updateFilterSelection(container, selectedBtn) {
    container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    selectedBtn.classList.add('active');
}

// Get Filtered Gods
function getFilteredGods() {
    if (!godsData) return [];

    return godsData.gods.filter(god => {
        if (currentFilters.class !== 'all' && god.class !== currentFilters.class) return false;
        if (currentFilters.pantheon !== 'all' && god.pantheon !== currentFilters.pantheon) return false;
        if (currentFilters.damageType !== 'all' && god.damageType !== currentFilters.damageType) return false;
        return true;
    });
}

// Random Selection Helper
function getRandomItem(array, excludeItems = []) {
    const available = array.filter(item => !excludeItems.includes(item));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

// Get Items for God's Damage Type
function getItemsForGod(god) {
    if (!itemsData || !god) return { offensive: [], defensive: [], hybrid: [], relicUpgrades: [] };

    const damageType = god.damageType;
    // Upgraded relics can be purchased by anyone
    const relicUpgrades = itemsData.relicUpgrades || [];

    if (damageType === 'Physical') {
        return {
            offensive: itemsData.tier3.physicalOffensive,
            defensive: itemsData.tier3.defense,
            hybrid: itemsData.tier3.hybrid,
            relicUpgrades: relicUpgrades
        };
    } else {
        return {
            offensive: itemsData.tier3.magicalOffensive,
            defensive: itemsData.tier3.defense,
            hybrid: itemsData.tier3.hybrid,
            relicUpgrades: relicUpgrades
        };
    }
}

// Get Starter Items for God
function getStartersForGod(god) {
    if (!itemsData || !god) return [];

    const damageType = god.damageType;
    const godClass = god.class;
    const starters = [];

    // Add damage type appropriate starters
    if (damageType === 'Physical') {
        starters.push(...itemsData.starters.physical);
    } else {
        starters.push(...itemsData.starters.magical);
    }

    // Add support starters for Guardians (and optionally Warriors)
    if (godClass === 'Guardian') {
        starters.push(...itemsData.starters.support);
    }

    return starters;
}

// Generate Random Build
function generateBuild(god) {
    const items = getItemsForGod(god);
    // Include upgraded relics as purchasable items in the build
    const allItems = [...items.offensive, ...items.defensive, ...items.hybrid, ...items.relicUpgrades];
    const selectedItems = [];

    // Select 6 unique items
    for (let i = 0; i < 6; i++) {
        const item = getRandomItem(allItems, selectedItems);
        if (item) selectedItems.push(item);
    }

    return selectedItems;
}

// Generate Random Relic (Smite 2 only allows 1 relic per match)
function generateRelic() {
    if (!itemsData) return null;
    return getRandomItem(itemsData.relics);
}

// Main Randomise Function
function randomise() {
    const filteredGods = getFilteredGods();

    if (filteredGods.length === 0) {
        alert('No gods match your current filters. Please adjust your filters.');
        return;
    }

    // Reset rerolls
    rerollsRemaining = parseInt(rerollCountInput.value) || 3;

    // Select random god
    currentResult.god = getRandomItem(filteredGods);

    // Generate starter if enabled
    if (includeStarterCheckbox.checked) {
        const starters = getStartersForGod(currentResult.god);
        currentResult.starter = getRandomItem(starters);
    } else {
        currentResult.starter = null;
    }

    // Generate build
    currentResult.items = generateBuild(currentResult.god);

    // Generate relic if enabled (Smite 2 = 1 relic per match)
    if (includeRelicsCheckbox.checked) {
        currentResult.relic = generateRelic();
    } else {
        currentResult.relic = null;
    }

    // Display results
    displayResults();
}

// Display Results
function displayResults() {
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Update reroll counter
    document.getElementById('rerollsRemaining').textContent = rerollsRemaining;

    // Display god
    displayGod();

    // Display starter
    displayStarter();

    // Display items
    displayItems();

    // Display relic
    displayRelic();

    // Update reroll buttons
    updateRerollButtons();
}

function displayGod() {
    const god = currentResult.god;
    const godIcon = document.getElementById('godIcon');
    const godName = document.getElementById('godName');
    const godDetails = document.getElementById('godDetails');

    // Set god image
    const imageUrl = getGodImageUrl(god.name);
    godIcon.innerHTML = `<img src="${imageUrl}" alt="${god.name}" onerror="this.style.display='none'; this.parentElement.textContent='${god.name.charAt(0)}';">`;
    godName.textContent = god.name;

    const damageClass = god.damageType.toLowerCase();
    godDetails.innerHTML = `${god.class} | ${god.pantheon} | <span class="${damageClass}">${god.damageType}</span>`;
}

function displayStarter() {
    const starterRow = document.getElementById('starterRow');
    const starterSlot = document.getElementById('starterSlot');

    if (includeStarterCheckbox.checked && currentResult.starter) {
        starterRow.style.display = 'block';
        const starter = currentResult.starter;
        const imageUrl = getItemImageUrl(starter.name, 'Starter', starter.tier);
        starterSlot.querySelector('.item-icon').innerHTML = `<img src="${imageUrl}" alt="${starter.name}" onerror="this.style.display='none';">`;
        starterSlot.querySelector('.item-name').textContent = starter.name;
    } else {
        starterRow.style.display = 'none';
    }
}

function displayItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';

    currentResult.items.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'item-slot';
        const imageUrl = getItemImageUrl(item.name, 'T3');
        slot.innerHTML = `
            <div class="item-icon"><img src="${imageUrl}" alt="${item.name}" onerror="this.style.display='none';"></div>
            <span class="item-name">${item.name}</span>
            <button class="reroll-btn" data-target="item" data-index="${index}" title="Reroll Item">&#x21bb;</button>
        `;
        itemsGrid.appendChild(slot);
    });

    // Add reroll handlers
    itemsGrid.querySelectorAll('.reroll-btn').forEach(btn => {
        btn.addEventListener('click', handleReroll);
    });
}

function displayRelic() {
    const relicRow = document.getElementById('relicsRow');
    const relicSlot = document.getElementById('relicSlot');

    if (includeRelicsCheckbox.checked && currentResult.relic) {
        relicRow.style.display = 'block';
        const relic = currentResult.relic;
        const imageUrl = getItemImageUrl(relic.name, 'Relic');
        relicSlot.querySelector('.item-icon').innerHTML = `<img src="${imageUrl}" alt="${relic.name}" onerror="this.style.display='none';">`;
        relicSlot.querySelector('.item-name').textContent = relic.name;
    } else {
        relicRow.style.display = 'none';
    }
}

// Reroll Handler
function handleReroll(e) {
    if (rerollsRemaining <= 0) {
        alert('No rerolls remaining!');
        return;
    }

    const target = e.target.dataset.target;
    const index = parseInt(e.target.dataset.index);

    switch (target) {
        case 'god':
            rerollGod();
            break;
        case 'starter':
            rerollStarter();
            break;
        case 'item':
            rerollItem(index);
            break;
        case 'relic':
            rerollRelic();
            break;
    }

    rerollsRemaining--;
    document.getElementById('rerollsRemaining').textContent = rerollsRemaining;
    updateRerollButtons();
}

function rerollGod() {
    const filteredGods = getFilteredGods();
    const newGod = getRandomItem(filteredGods, [currentResult.god]);

    if (newGod) {
        currentResult.god = newGod;

        // Regenerate starter for new god's damage type
        if (includeStarterCheckbox.checked) {
            const starters = getStartersForGod(currentResult.god);
            currentResult.starter = getRandomItem(starters);
        }

        // Regenerate build for new god's damage type
        currentResult.items = generateBuild(currentResult.god);

        displayGod();
        displayStarter();
        displayItems();
    }
}

function rerollStarter() {
    const starters = getStartersForGod(currentResult.god);
    const newStarter = getRandomItem(starters, [currentResult.starter]);

    if (newStarter) {
        currentResult.starter = newStarter;
        displayStarter();
    }
}

function rerollItem(index) {
    const items = getItemsForGod(currentResult.god);
    const allItems = [...items.offensive, ...items.defensive, ...items.hybrid, ...items.relicUpgrades];
    const newItem = getRandomItem(allItems, currentResult.items);

    if (newItem) {
        currentResult.items[index] = newItem;
        displayItems();
    }
}

function rerollRelic() {
    const newRelic = getRandomItem(itemsData.relics, [currentResult.relic]);

    if (newRelic) {
        currentResult.relic = newRelic;
        displayRelic();
    }
}

function updateRerollButtons() {
    const allRerollBtns = document.querySelectorAll('.reroll-btn');
    allRerollBtns.forEach(btn => {
        btn.disabled = rerollsRemaining <= 0;
    });
}

// Setup Static Reroll Handlers
function setupStaticRerollHandlers() {
    const godRerollBtn = document.querySelector('.god-card .reroll-btn');
    if (godRerollBtn) {
        godRerollBtn.addEventListener('click', handleReroll);
    }

    const starterRerollBtn = document.querySelector('#starterSlot .reroll-btn');
    if (starterRerollBtn) {
        starterRerollBtn.addEventListener('click', handleReroll);
    }

    const relicRerollBtn = document.querySelector('#relicSlot .reroll-btn');
    if (relicRerollBtn) {
        relicRerollBtn.addEventListener('click', handleReroll);
    }
}

// Initialize
async function init() {
    await loadData();
    setupFilterHandlers();
    setupStaticRerollHandlers();

    randomiseBtn.addEventListener('click', randomise);

    console.log('Smite 2 Randomiser initialized');
}

// Start the app
init();
