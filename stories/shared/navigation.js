// Updated navigation.js with two-level dropdown for collections and partner support
document.addEventListener('DOMContentLoaded', function() {
  const navPlaceholder = document.getElementById('nav-placeholder');
  
// Create the navigation HTML base
const navHTML = `
  <nav class="site-nav">
    <div class="nav-container">
      <div class="logo">
        <img src="https://www.dwarvenforged.com/img/logo.jpg" alt="Dwarven Forged Logo">
        <h1 class="site-title"><a href="https://www.dwarvenforged.com">Dwarven Forged Stories</a></h1>
      </div>
      <div class="nav-links">
        <div class="nav-dropdown">
          <button class="dropdown-button">Stories</button>
          <div class="dropdown-content" id="stories-dropdown">
            <div class="collection-selector">
              <div class="collection-option" data-collection="1">
                <span class="collection-title">Collection I: The Early Years</span>
                <span class="collection-count" id="collection1-count">0 stories</span>
              </div>
              <div class="collection-option" data-collection="2">
                <span class="collection-title">Collection II: The Master's Art</span>
                <span class="collection-count" id="collection2-count">0 stories</span>
              </div>
            </div>
            <div class="stories-list" id="collection1-stories" style="display: none;">
              <div class="back-button" data-target="selector">← Back to Collections</div>
              <div class="collection-header">Collection I: The Early Years</div>
              <div class="stories-container" id="collection1-container"></div>
            </div>
            <div class="stories-list" id="collection2-stories" style="display: none;">
              <div class="back-button" data-target="selector">← Back to Collections</div>
              <div class="collection-header">Collection II: The Master's Art</div>
              <div class="stories-container" id="collection2-container"></div>
            </div>
          </div>
        </div>
        <a href="/stories/" class="nav-button">All Stories</a>
        <a href="https://www.dwarvenforged.com" class="home-button">Return to Main Site</a>
      </div>
    </div>
  </nav>
  
  <style>
    .collection-selector {
      padding: 0;
    }
    
    .collection-option {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #e0d4c3;
      transition: background-color 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .collection-option:hover {
      background-color: #f8f2e9;
    }
    
    .collection-option:last-child {
      border-bottom: none;
    }
    
    .collection-title {
      font-weight: bold;
      color: #8B4513;
    }
    
    .collection-count {
      font-size: 0.9em;
      color: #A0522D;
    }
    
    .stories-list {
      min-width: 300px;
    }
    
    .back-button {
      padding: 12px 16px;
      cursor: pointer;
      background-color: #f8f2e9;
      border-bottom: 2px solid #e0d4c3;
      color: #8B4513;
      font-weight: bold;
      transition: background-color 0.2s ease;
    }
    
    .back-button:hover {
      background-color: #f0e8db;
    }
    
    .collection-header {
      padding: 12px 16px;
      background-color: #8B4513;
      color: white;
      font-weight: bold;
      text-align: center;
    }
    
    .stories-container {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .story-item {
      padding: 10px 16px;
      display: flex;
      align-items: center;
      color: #5D4037;
      text-decoration: none;
      border-bottom: 1px solid #f0e8db;
      transition: background-color 0.2s ease;
      position: relative;
    }
    
    .story-item:hover {
      background-color: #f8f2e9;
    }
    
    .story-number {
      background-color: #A0522D;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: bold;
      margin-right: 12px;
      min-width: 24px;
      text-align: center;
    }
    
    .dropdown-content a {
      color: inherit;
      text-decoration: none;
    }
    
    .dropdown-content a:hover {
      color: inherit;
    }
    
    .partner-badge {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      background: #A0522D;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      font-weight: bold;
    }
    
    .story-partner-attribution {
      margin: 3rem 0 2rem 0;
      padding: 2rem;
      background: linear-gradient(135deg, #f8f2e9, #f0e8db);
      border: 2px solid #d4c4a8;
      border-radius: 12px;
      text-align: center;
    }
    
    .partner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    
    .story-partner-attribution .partner-logo {
      max-width: 200px;
      max-height: 100px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(139, 69, 19, 0.2);
    }
    
    .story-partner-attribution .partner-text {
      flex: 1;
      min-width: 250px;
      text-align: left;
    }
    
    .story-partner-attribution h4 {
      font-size: 1.1rem;
      color: #8B4513;
      margin: 0 0 0.5rem 0;
      font-style: italic;
    }
    
    .story-partner-attribution p {
      color: #5D4037;
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
    }
    
    .story-partner-attribution .partner-link {
      display: inline-block;
      padding: 8px 16px;
      background-color: #A0522D;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }
    
    .story-partner-attribution .partner-link:hover {
      background-color: #8B4513;
    }
    
    @media (max-width: 768px) {
      .partner-content {
        flex-direction: column;
        text-align: center;
      }
      .story-partner-attribution .partner-text {
        text-align: center;
      }
    }
  </style>
`;

  // Insert navigation
  navPlaceholder.innerHTML = navHTML;
  
  // Get dropdown elements
  const storiesDropdown = document.getElementById('stories-dropdown');
  const collectionSelector = document.querySelector('.collection-selector');
  const collection1Stories = document.getElementById('collection1-stories');
  const collection2Stories = document.getElementById('collection2-stories');
  
  // Master story data with partner information
  const masterStoryData = {
    collection1Order: ['0005', '0003', '0004', '0001', '0002', '0006', '0007', '0008', '0009', '0010', '0011', '0012'],
    collection2Order: ['2001', '2002', '2003', '2004', '2005', '2006', '2007'],
    
	collection1Stories: {
	  '0001': { title: 'The Forge Root Flame', path: '/stories/story-0001/index.html' },
	  '0002': { title: 'Daughter of the Forge', path: '/stories/story-0002/index.html' },
	  '0003': { title: 'The Forge Trial', path: '/stories/story-0003/index.html' },
	  '0004': { title: 'The Forge Council', path: '/stories/story-0004/index.html' },
	  '0005': { title: 'The Forge Wager', path: '/stories/story-0005/index.html' },
	  '0006': { title: 'The Forge Journey', path: '/stories/story-0006/index.html' },
	  '0007': { title: 'The Forge Detail', path: '/stories/story-0007/index.html' },
	  '0008': { 
		title: 'The Forge Chronicle', 
		path: '/stories/story-0008/index.html',
		partner: {
		  name: 'StrainNavigator',
		  image: 'https://www.dwarvenforged.com/stories/story-0008/StrainNavigator_Logo.jpg',
		  link: 'https://strainnavigator.com',
		  tagline: 'Your ultimate cannabis growing assistant and strain tracking tools'
		}
	  },
	  '0009': { title: 'The Forge Reunion', path: '/stories/story-0009/index.html' },
	  '0010': { title: 'The Forge Bond', path: '/stories/story-0010/index.html' },
	  '0011': { title: 'The Phoenix Flame', path: '/stories/story-0011/index.html' },
	  '0012': { 
		title: 'The Forge Memory', 
		path: '/stories/story-0012/index.html',
		partner: {
		  name: 'AI-Ministries',
		  image: 'https://www.dwarvenforged.com/stories/story-0012/AI_Ministries_Logo.jpg',
		  link: 'https://ai-ministries.com',
		  tagline: 'Exploring the intersection of AI, writing, and creativity'
		}
	  }
	},
    
	collection2Stories: {
	  '2001': { title: 'The Tattooed Seed', path: '/stories/story-2001/index.html' },
	  '2002': { 
		title: 'The Greenworld Envoys', 
		path: '/stories/story-2002/index.html',
		partner: {
		  name: 'GreenWrld',
		  image: 'https://www.dwarvenforged.com/stories/story-2002/GreenWrld_Logo.jpg',
		  link: 'https://greenwrldexclusive.com',
		  tagline: 'Growing green solutions across realms'
		}
	  },
	  '2003': { title: 'The Divine Harvest Contest', path: '/stories/story-2003/index.html' },
	  '2004': { title: 'The Spore Awakening', path: '/stories/story-2004/index.html' },
	  '2005': { 
		title: 'The Knoppr-Haeli Partnership', 
		path: '/stories/story-2005/index.html',
		partner: {
		  name: 'Gambit Growing',
		  image: 'https://www.dwarvenforged.com/stories/story-2005/Gambit_Flag.jpg',
		  link: 'https://gambitgrowing.com',
		  tagline: 'Innovative cultivation solutions for every realm'
		}
	  },
	  '2006': { 
		title: 'The Healing Grove', 
		path: '/stories/story-2006/index.html',
		partner: {
		  name: 'Tóke\'s Recovery',
		  image: 'https://www.dwarvenforged.com/stories/story-2006/Tokes_Recovery_Logo.jpg',
		  link: 'https://discord.gg/hwy2yw7s6h', 
		  tagline: 'Supporting healing journeys with community and understanding'
		}
	  },
	  
	  '2007': { 
		title: 'Athena\'s Wisdom: The Balance of Growth', 
		path: '/stories/story-2007/index.html',
		partner: {
		  name: 'Athena Nutrients',
		  image: 'https://www.dwarvenforged.com/stories/story-2007/Athena_Nutrients_Logo.jpg',
		  link: 'https://www.athenaag.com/',
		  tagline: 'Perfect balance for professional results'
		}
	  }	  
	  
	}
  };
  
  // Add click handlers for navigation
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('collection-option') || e.target.closest('.collection-option')) {
      const collectionOption = e.target.closest('.collection-option');
      const collectionNum = collectionOption.dataset.collection;
      
      // Hide selector, show stories list
      collectionSelector.style.display = 'none';
      if (collectionNum === '1') {
        collection1Stories.style.display = 'block';
      } else {
        collection2Stories.style.display = 'block';
      }
    }
    
    if (e.target.classList.contains('back-button')) {
      // Hide all story lists, show selector
      collection1Stories.style.display = 'none';
      collection2Stories.style.display = 'none';
      collectionSelector.style.display = 'block';
    }
  });
  
  // Populate stories for each collection
  function populateCollection(collectionNum, stories, order, containerId) {
    const container = document.getElementById(containerId);
    const currentPath = window.location.pathname;
    let storiesHTML = '';
    
    order.forEach((storyId, index) => {
      const story = stories[storyId];
      if (story) {
        const displayNumber = (index + 1).toString().padStart(2, '0');
        let path = story.path;
        
        // Adjust path if we're in a story directory
        if (currentPath.includes('/story-')) {
          path = path.replace('/stories/', '../');
        }
        
        // Check if this is the current story
        const isCurrentStory = currentPath.includes(`/story-${storyId}/`);
        const currentClass = isCurrentStory ? ' style="background-color: #f8f2e9; font-weight: bold;"' : '';
        
        // Partner badge only (no popup)
        let partnerHTML = '';
        if (story.partner) {
          partnerHTML = `<div class="partner-badge" title="Inspired by ${story.partner.name}">★</div>`;
        }

        storiesHTML += `
          <a href="${path}">
            <div class="story-item"${currentClass}>
              <span class="story-number">${displayNumber}</span>
              ${story.title}
              ${partnerHTML}
            </div>
          </a>
        `;
      }
    });
    
    container.innerHTML = storiesHTML;
    
    // Update collection count
    const countElement = document.getElementById(`collection${collectionNum}-count`);
    const storyCount = order.length;
    countElement.textContent = `${storyCount} stor${storyCount === 1 ? 'y' : 'ies'}`;
  }
  
  // Populate both collections
  populateCollection(1, masterStoryData.collection1Stories, masterStoryData.collection1Order, 'collection1-container');
  populateCollection(2, masterStoryData.collection2Stories, masterStoryData.collection2Order, 'collection2-container');
  
  // Adjust "All Stories" link if needed
  const currentPath = window.location.pathname;
  if (currentPath.includes('/story-')) {
    const allStoriesLink = document.querySelector('.nav-button');
    if (allStoriesLink && allStoriesLink.getAttribute('href') === '/stories/') {
      allStoriesLink.setAttribute('href', '../');
    }
    
    // Update story navigation
    updateStoryNavigation(currentPath);
  }
  
  // Navigation function
  function updateStoryNavigation(currentPath) {
    const seriesNav = document.querySelector('.series-navigation');
    if (!seriesNav) return;
    
    const storyMatch = currentPath.match(/story-(\d{4})/);
    if (!storyMatch) return;
    
    const currentStoryId = storyMatch[1];
    let collection, order, stories;
    
    if (masterStoryData.collection1Stories[currentStoryId]) {
      collection = 1;
      order = masterStoryData.collection1Order;
      stories = masterStoryData.collection1Stories;
    } else if (masterStoryData.collection2Stories[currentStoryId]) {
      collection = 2;
      order = masterStoryData.collection2Order;
      stories = masterStoryData.collection2Stories;
    } else {
      return;
    }
    
    const currentIndex = order.indexOf(currentStoryId);
    if (currentIndex === -1) return;
    
    const prevStoryId = currentIndex > 0 ? order[currentIndex - 1] : null;
    const nextStoryId = currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
    
    const prevButton = seriesNav.querySelector('.nav-prev');
    const nextButton = seriesNav.querySelector('.nav-next');
    
    if (prevButton) {
      if (prevStoryId) {
        const prevStory = stories[prevStoryId];
        prevButton.href = prevStory.path.replace('/stories/', '../');
        prevButton.textContent = prevStory.title;
        prevButton.classList.remove('disabled');
      } else {
        prevButton.href = '#';
        prevButton.textContent = 'Previous Story';
        prevButton.classList.add('disabled');
      }
    }
    
    if (nextButton) {
      if (nextStoryId) {
        const nextStory = stories[nextStoryId];
        nextButton.href = nextStory.path.replace('/stories/', '../');
        nextButton.textContent = nextStory.title;
        nextButton.classList.remove('disabled');
      } else {
        nextButton.href = '#';
        nextButton.textContent = 'Next Story';
        nextButton.classList.add('disabled');
      }
    }
  }
  
  // Display partner attribution on story pages
  function displayPartnerAttribution() {
    const currentPath = window.location.pathname;
    const storyMatch = currentPath.match(/story-(\d{4})/);
    if (!storyMatch) return;
    
    const currentStoryId = storyMatch[1];
    let story = null;
    
    // Find the story and its partner info
    if (masterStoryData.collection1Stories[currentStoryId]) {
      story = masterStoryData.collection1Stories[currentStoryId];
    } else if (masterStoryData.collection2Stories[currentStoryId]) {
      story = masterStoryData.collection2Stories[currentStoryId];
    }
    
    // If story has partner info, display it
    if (story && story.partner) {
      const partnerHTML = `
        <div class="story-partner-attribution">
          <div class="partner-content">
            <img src="${story.partner.image}" alt="${story.partner.name}" class="partner-logo">
            <div class="partner-text">
              <h4>Inspired by ${story.partner.name}</h4>
              <p>${story.partner.tagline}</p>
              <a href="${story.partner.link}" target="_blank" class="partner-link">Visit ${story.partner.name} →</a>
            </div>
          </div>
        </div>
      `;
      
      // Insert before the series navigation
      const seriesNav = document.querySelector('.series-navigation');
      if (seriesNav) {
        seriesNav.insertAdjacentHTML('beforebegin', partnerHTML);
      } else {
        const contentContainer = document.querySelector('.content-container');
        if (contentContainer) {
          contentContainer.insertAdjacentHTML('beforeend', partnerHTML);
        }
      }
    }
  }
  
  // Call the partner attribution function
  displayPartnerAttribution();
});
