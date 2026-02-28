// ------------------------------
// News Viewer JS - Enhanced UI/UX
// ------------------------------

// DOM Elements
const elements = {
  btns: [
    document.getElementById("btn1"),
    document.getElementById("btn2"),
    document.getElementById("btn3"),
    document.getElementById("btn4")
  ],
  exportBtn: document.getElementById("exportBtn"),
  content: document.getElementById("content"),
  imageContainer: document.getElementById("image-container"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  categoryBadge: document.getElementById("categoryBadge"),
  timestamp: document.getElementById("timestamp"),
  articlesCount: document.getElementById("articlesCount"),
  topicsCount: document.getElementById("topicsCount"),
  trendingScore: document.getElementById("trendingScore"),
  lastUpdated: document.getElementById("lastUpdated"),
  aboutLink: document.getElementById("aboutLink"),
  aboutModal: document.getElementById("aboutModal"),
  closeModal: document.getElementById("closeModal"),
  vizTabs: document.querySelectorAll('.viz-tab'),
  featureImpactList: document.getElementById('featureImpactList')
};

// Category configurations
const categories = {
  business: { text: "business.txt", main: "business.png", heatmap: "business_heatmap.png", wordcloud: "business_wordcloud.png", icon: "fas fa-briefcase", color: "#10b981", description: "Market trends & financial insights" },
  entertainment: { text: "entertainment.txt", main: "entertainment.png", heatmap: "entertainment_heatmap.png", wordcloud: "entertainment_wordcloud.png", icon: "fas fa-film", color: "#f59e0b", description: "Media, arts & cultural analysis" },
  health: { text: "health.txt", main: "health.png", heatmap: "health_heatmap.png", wordcloud: "health_wordcloud.png", icon: "fas fa-heartbeat", color: "#ef4444", description: "Medical & wellness insights", hasInsufficientContent: false },
  science: { text: "science.txt", main: "science.png", heatmap: "science_heatmap.png", wordcloud: "science_wordcloud.png", icon: "fas fa-flask", color: "#8b5cf6", description: "Research & technological advances", hasInsufficientContent: false }
};

// State
let currentCategory = null;
let currentVizType = 'main';

// ------------------------------
// Initialization
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Category buttons
  elements.btns.forEach((btn, idx) => {
    if (!btn) return;
    const categoryName = Object.keys(categories)[idx];
    btn.addEventListener('click', () => selectCategory(btn, categoryName));
  });

  // Export button
  if (elements.exportBtn) elements.exportBtn.addEventListener('click', exportReport);

  // About modal
  if (elements.aboutLink) elements.aboutLink.addEventListener('click', showAboutModal);
  if (elements.closeModal) elements.closeModal.addEventListener('click', hideAboutModal);
  if (elements.aboutModal) elements.aboutModal.addEventListener('click', e => { if (e.target === elements.aboutModal) hideAboutModal(); });

  // Visualization tabs
  elements.vizTabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      switchVisualization(tab.dataset.viz);
    });
  });

  // Keyboard shortcuts & Escape
  document.addEventListener('keydown', handleKeyboard);

  // Touch support for swipe
  initTouchEvents();

  // Initial placeholders
  showPlaceholder();
});

// ------------------------------
// Category Selection
// ------------------------------
function selectCategory(button, categoryName) {
  animateClick(button);
  loadCategory(categoryName);
}

function animateClick(element) {
  element.style.animation = 'bounce 0.6s ease-in-out';
  setTimeout(() => element.style.animation = '', 600);
}

// ------------------------------
// Load Category
// ------------------------------
async function loadCategory(categoryName) {
  if (!categories[categoryName]) return;
  currentCategory = categoryName;
  currentVizType = 'main';
  const category = categories[categoryName];

  showLoading();
  updateCategoryBadge(categoryName);
  updateTimestamp();
  elements.content.innerHTML = '';
  elements.imageContainer.innerHTML = '';

  try {
    // Fetch text
    const textResp = await fetch(`../dataset/final/${category.text}`);
    let textContent = textResp.ok ? await textResp.text() : '';
    if (!textContent || textContent.length < 20) textContent = "Insufficient content";

    // Show news content
    if (textContent.includes("Insufficient content") || category.hasInsufficientContent) {
      showInsufficientContent(categoryName);
    } else {
      elements.content.innerHTML = `<div class="news-content"><p>${textContent.replace(/\. /g, '.\n\n')}</p></div>`;
    }

    // Load main visualization
    if (category.main) await loadVisualization(category.main, 'main');

    // Update analytics with mock values
    updateAnalytics({
      articles: Math.floor(Math.random() * 50) + 20,
      topics: Math.floor(Math.random() * 15) + 5,
      trending: Math.floor(Math.random() * 40) + 60,
      updated: new Date().toLocaleString()
    });

    // Animate content
    animateContent();
  } catch (err) {
    console.error(err);
    showError("Failed to load category content.");
  } finally {
    hideLoading();
  }
}

// ------------------------------
// Show Placeholder / Error
// ------------------------------
function showPlaceholder() {
  elements.content.innerHTML = `<div class="placeholder"><i class="fas fa-chart-bar"></i><p>Select a category above to view news analysis.</p></div>`;
  elements.imageContainer.innerHTML = `<div class="image-placeholder"><i class="fas fa-chart-pie"></i><p>Select a category to view visualizations.</p></div>`;
  updateAnalytics({ articles: 0, topics: 0, trending: 0, updated: '-' });
}

function showError(msg) {
  elements.content.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>${msg}</p></div>`;
}

function showInsufficientContent(categoryName) {
  elements.content.innerHTML = `
    <div class="insufficient-content">
      <i class="fas fa-exclamation-triangle"></i>
      <h4>Insufficient Content</h4>
      <p>There isn't enough ${categoryName} news content available.</p>
    </div>
  `;
  elements.imageContainer.innerHTML = `<div class="image-placeholder"><i class="fas fa-image"></i><p>No visualization available</p></div>`;
}

// ------------------------------
// Visualization
// ------------------------------
async function switchVisualization(vizType) {
  if (!currentCategory) return;
  currentVizType = vizType;
  const category = categories[currentCategory];
  elements.vizTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.viz === vizType));
  const file = category[vizType];
  await loadVisualization(file, vizType);
}

async function loadVisualization(file, type) {
  if (!file) {
    elements.imageContainer.innerHTML = `<div class="image-placeholder"><i class="fas fa-exclamation-triangle"></i><p>No visualization available.</p></div>`;
    return;
  }

  try {
    showLoading();
    const resp = await fetch(`../dataset/graphs/${file}`);
    if (!resp.ok) throw new Error("Image not found");
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    elements.imageContainer.innerHTML = `<img src="${url}" alt="${currentCategory} ${type}" class="news-image" />`;
  } catch {
    elements.imageContainer.innerHTML = `<div class="image-placeholder"><i class="fas fa-image"></i><p>Visualization failed to load.</p></div>`;
  } finally {
    hideLoading();
  }
}

// ------------------------------
// Analytics
// ------------------------------
function updateAnalytics(data) {
  elements.articlesCount.textContent = data.articles;
  elements.topicsCount.textContent = data.topics;
  elements.trendingScore.textContent = data.trending + '%';
  elements.lastUpdated.textContent = data.updated;
}

// ------------------------------
// Loading Overlay
// ------------------------------
function showLoading() { elements.loadingOverlay?.classList.add('show'); }
function hideLoading() { elements.loadingOverlay?.classList.remove('show'); }

// ------------------------------
// Export
// ------------------------------
function exportReport() {
  if (!currentCategory) { alert('Select a category first.'); return; }
  const report = { category: currentCategory, visualization: currentVizType, analytics: { articles: elements.articlesCount.textContent, topics: elements.topicsCount.textContent, trending: elements.trendingScore.textContent, updated: elements.lastUpdated.textContent } };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${currentCategory}_report.json`; a.click(); URL.revokeObjectURL(url);
}

// ------------------------------
// About Modal
// ------------------------------
function showAboutModal() { elements.aboutModal.classList.add('show'); document.body.style.overflow = 'hidden'; }
function hideAboutModal() { elements.aboutModal.classList.remove('show'); document.body.style.overflow = 'auto'; }

// ------------------------------
// Content Animation
// ------------------------------
function animateContent() {
  const card = document.querySelector('.content-card');
  if (!card) return;
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'fadeIn 0.6s ease-out';
}

// ------------------------------
// Keyboard & Touch
// ------------------------------
function handleKeyboard(e) {
  if (e.key === 'Escape') { hideLoading(); hideAboutModal(); }
  if (e.key >= '1' && e.key <= '4') {
    const idx = parseInt(e.key)-1;
    const categoryName = Object.keys(categories)[idx];
    selectCategory(elements.btns[idx], categoryName);
  }
}

function initTouchEvents() {
  let startX = 0;
  document.addEventListener('touchstart', e => startX = e.changedTouches[0].screenX);
  document.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) console.log('Swipe detected:', diff > 0 ? 'left' : 'right');
  });
}

// ------------------------------
// Feature Impact (SHAP Placeholder)
// ------------------------------
function updateFeatureImpact(explanation = {}) {
  const list = elements.featureImpactList;
  if (!list) return;
  list.innerHTML = '';
  if (!explanation || Object.keys(explanation).length === 0) {
    list.innerHTML = '<li>No explainability data available.</li>'; return;
  }
  for (const [feat, val] of Object.entries(explanation)) {
    const li = document.createElement('li');
    li.textContent = `${feat}: ${val.toFixed(4)}`;
    li.className = val >= 0 ? 'positive' : 'negative';
    list.appendChild(li);
  }
}

// Example SHAP test
updateFeatureImpact({ "Market Sentiment": 0.23, "Volume Change": -0.14, "Tech News Score": 0.51 });