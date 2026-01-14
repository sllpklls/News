// Hiển thị ngày giờ hiện tại
function updateDate() {
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('vi-VN', options);
}

updateDate();
loadNews();

// Xử lý tìm kiếm
function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// Enter để tìm kiếm
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Load dữ liệu từ API
async function loadNews() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.news && data.news.length > 0) {
            // Hiển thị tin nổi bật (featured)
            const featured = data.news.find(item => item.featured);
            if (featured) {
                displayFeatured(featured);
            }
            
            // Hiển thị tin xu hướng (4 tin đầu)
            const trending = data.news.slice(0, 4);
            displayTrending(trending);
            
            // Hiển thị tin mới nhất (3 tin đầu)
            const latest = data.news.slice(0, 3);
            displayLatest(latest);
            
            // Hiển thị grid tin tức (6 tin đầu)
            const gridNews = data.news.slice(0, 6);
            displayNewsGrid(gridNews);
        }
    } catch (error) {
        console.error('Lỗi khi tải tin tức:', error);
    }
}

function displayFeatured(article) {
    const featuredSection = document.querySelector('.featured-news');
    if (!featuredSection) return;
    
    featuredSection.innerHTML = `
        <img src="${article.imageUrl}" alt="${article.title}" style="cursor: pointer;" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
        <div class="featured-content" style="cursor: pointer;" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
            <span class="category-badge">${article.category}</span>
            <h1>${article.title}</h1>
            <div class="meta-info">
                <span>📅 ${formatDate(article.date)}</span> • 
                <span>✍️ ${article.author}</span> • 
                <span>👁️ ${article.views} lượt xem</span>
            </div>
            <p>${article.excerpt}</p>
        </div>
    `;
}

function displayTrending(articles) {
    const trendingBox = document.querySelector('.trending-box');
    if (!trendingBox) return;
    
    let html = '<h3>🔥 Tin nổi bật</h3>';
    articles.forEach(article => {
        html += `
            <div class="trending-item" style="cursor: pointer;" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
                <h4>${article.title}</h4>
                <span>${getTimeAgo(article.date)}</span>
            </div>
        `;
    });
    trendingBox.innerHTML = html;
}

function displayLatest(articles) {
    const latestBox = document.querySelector('.latest-box');
    if (!latestBox) return;
    
    let html = '<h3>📰 Tin mới nhất</h3>';
    articles.forEach(article => {
        html += `
            <div class="latest-item" style="cursor: pointer;" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
                <h4>${article.title}</h4>
                <span>${getTimeAgo(article.date)}</span>
            </div>
        `;
    });
    latestBox.innerHTML = html;
}

function displayNewsGrid(articles) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    newsGrid.innerHTML = articles.map(article => `
        <div class="news-card" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
            <img src="${article.imageUrl}" alt="${article.title}">
            <div class="news-card-content">
                <span class="category-badge">${article.category}</span>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return formatDate(dateString);
}

// Xử lý active state cho navigation
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Hover effect cho các card tin tức
document.addEventListener('click', function(e) {
    if (e.target.closest('.news-card')) {
        const card = e.target.closest('.news-card');
        const title = card.querySelector('h3').textContent;
        console.log('Đọc tin: ' + title);
    }
});
