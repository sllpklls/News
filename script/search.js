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

let allNews = [];
let searchResults = [];
let currentQuery = '';

// Lấy từ khóa tìm kiếm từ URL
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');

if (query) {
    document.getElementById('search-input').value = query;
    currentQuery = query;
    loadAndSearch();
} else {
    document.getElementById('no-results').style.display = 'block';
}

// Tải dữ liệu và thực hiện tìm kiếm
async function loadAndSearch() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        allNews = data.news || [];
        
        performSearchWithData();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
}

// Thực hiện tìm kiếm
function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// Enter để tìm kiếm
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Tìm kiếm với dữ liệu đã tải
function performSearchWithData() {
    const query = currentQuery.toLowerCase();
    
    // Loại bỏ dấu tiếng Việt để tìm kiếm tốt hơn
    const normalizedQuery = removeVietnameseTones(query);
    
    searchResults = allNews.filter(article => {
        const title = removeVietnameseTones(article.title.toLowerCase());
        const excerpt = removeVietnameseTones(article.excerpt.toLowerCase());
        const content = removeVietnameseTones(article.content.toLowerCase());
        const author = removeVietnameseTones(article.author.toLowerCase());
        const category = removeVietnameseTones(article.category.toLowerCase());
        
        return title.includes(normalizedQuery) || 
               excerpt.includes(normalizedQuery) || 
               content.includes(normalizedQuery) ||
               author.includes(normalizedQuery) ||
               category.includes(normalizedQuery);
    });
    
    displayResults();
}

// Hiển thị kết quả
function displayResults() {
    const resultsContainer = document.getElementById('search-results');
    const noResults = document.getElementById('no-results');
    const categoryFilter = document.getElementById('category-filter').value;
    
    // Lọc theo chuyên mục nếu có
    let filteredResults = searchResults;
    if (categoryFilter) {
        filteredResults = searchResults.filter(article => article.category === categoryFilter);
    }
    
    // Cập nhật thông tin tìm kiếm
    document.getElementById('search-query').innerHTML = `🔍 Từ khóa: <strong>"${currentQuery}"</strong>`;
    document.getElementById('search-count').innerHTML = `📊 Tìm thấy <strong>${filteredResults.length}</strong> kết quả`;
    
    if (filteredResults.length === 0) {
        resultsContainer.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    resultsContainer.style.display = 'grid';
    noResults.style.display = 'none';
    
    resultsContainer.innerHTML = filteredResults.map(article => {
        const highlightedTitle = highlightText(article.title, currentQuery);
        const highlightedExcerpt = highlightText(article.excerpt.substring(0, 200), currentQuery);
        
        return `
            <div class="search-result-item" onclick="window.location.href='article.html?id=${article.id}&author=${encodeURIComponent(article.author)}'">
                <img src="${article.imageUrl}" alt="${article.title}" class="search-result-image">
                <div class="search-result-content">
                    <span class="category-badge">${article.category}</span>
                    <h3>${highlightedTitle}</h3>
                    <div class="search-result-meta">
                        <span>✍️ ${article.author}</span>
                        <span>📅 ${formatDate(article.date)}</span>
                        <span>👁️ ${article.views} lượt xem</span>
                    </div>
                    <p class="search-result-excerpt">${highlightedExcerpt}...</p>
                </div>
            </div>
        `;
    }).join('');
}

// Lọc kết quả theo chuyên mục
function filterResults() {
    displayResults();
}

// Highlight từ khóa trong văn bản
function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Escape ký tự đặc biệt trong regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    return str;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
