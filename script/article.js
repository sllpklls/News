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

// Hiển thị trang 404
function show404Page() {
    document.body.innerHTML = `
        <div style="text-align: center; padding: 100px 20px; font-family: 'Segoe UI', sans-serif;">
            <h1 style="font-size: 120px; margin: 0; color: #c41e3a;">404</h1>
            <h2 style="font-size: 32px; margin: 20px 0; color: #333;">Không tìm thấy trang</h2>
            <p style="font-size: 18px; color: #666; margin-bottom: 30px;">URL không hợp lệ hoặc bài viết không tồn tại.</p>
            <button onclick="window.location.href='index.html'" style="padding: 15px 30px; background: #c41e3a; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
                🏠 Về trang chủ
            </button>
        </div>
    `;
}

// Lấy ID bài viết và author từ URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');
const authorParam = urlParams.get('author');

if (!articleId || !authorParam) {
    // Hiển thị page 404
    show404Page();
} else {
    loadArticle(articleId);
}

// Load chi tiết bài viết
async function loadArticle(id) {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        const article = data.news.find(item => item.id == id);
        
        if (article) {
            displayArticle(article);
            loadRelatedNews(data.news, article.category, article.id);
        } else {
            show404Page();
        }
    } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        alert('Lỗi khi tải bài viết!');
    }
}

// Hiển thị chi tiết bài viết
function displayArticle(article) {
    document.title = article.title + ' - Báo Điện Tử';
    
    document.getElementById('breadcrumb-category').textContent = article.category;
    document.getElementById('breadcrumb-title').textContent = article.title.substring(0, 30) + '...';
    
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-date').textContent = formatDate(article.date);
    document.getElementById('article-author').textContent = article.author;
    document.getElementById('article-views').textContent = article.views;
    document.getElementById('article-img').src = article.imageUrl;
    document.getElementById('article-img').alt = article.title;
    document.getElementById('article-excerpt').textContent = article.excerpt;
    document.getElementById('article-content').innerHTML = formatContent(article.content);
}

// Format nội dung bài viết
function formatContent(content) {
    // Chia nội dung thành các đoạn văn
    const paragraphs = content.split('\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p}</p>`).join('');
}

// Load tin liên quan
function loadRelatedNews(allNews, category, currentId) {
    // Lọc tin cùng chuyên mục, loại bỏ bài hiện tại
    const related = allNews
        .filter(item => item.category === category && item.id != currentId)
        .slice(0, 3);
    
    const relatedGrid = document.getElementById('related-news-grid');
    
    if (related.length > 0) {
        relatedGrid.innerHTML = related.map(article => `
            <div class="news-card" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
                <img src="${article.imageUrl}" alt="${article.title}">
                <div class="news-card-content">
                    <span class="category-badge">${article.category}</span>
                    <h3>${article.title}</h3>
                    <p>${article.excerpt.substring(0, 100)}...</p>
                </div>
            </div>
        `).join('');
    } else {
        relatedGrid.innerHTML = '<p style="text-align: center; color: #999;">Không có tin liên quan</p>';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Xử lý chia sẻ
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const currentUrl = window.location.href;
        const title = document.getElementById('article-title').textContent;
        
        if (this.classList.contains('facebook')) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
        } else if (this.classList.contains('twitter')) {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`, '_blank');
        } else if (this.classList.contains('linkedin')) {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
        } else if (this.classList.contains('copy')) {
            navigator.clipboard.writeText(currentUrl).then(() => {
                alert('Đã sao chép link!');
            });
        }
    });
});
