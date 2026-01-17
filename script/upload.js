// Biến tracking upload
let isUploading = false;

// Xử lý upload ảnh
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        e.target.value = '';
        return;
    }

    // Kiểm tra kích thước file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');
        e.target.value = '';
        return;
    }

    // Đánh dấu đang upload
    isUploading = true;
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Đang upload ảnh...';

    // Hiển thị preview ngay lập tức
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload lên server
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Lỗi khi upload ảnh');
        }

        const result = await response.json();
        
        // Cập nhật URL ảnh vào input
        document.getElementById('imageUrl').value = result.url;
        
        // Hiển thị thông báo thành công
        console.log('Upload ảnh thành công:', result.url);
        
        // Đã upload xong
        isUploading = false;
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Lưu bài viết';
    } catch (error) {
        console.error('Lỗi khi upload:', error);
        alert('Lỗi khi upload ảnh: ' + error.message);
        
        // Reset nếu lỗi
        isUploading = false;
        submitBtn.disabled = false;
        submitBtn.textContent = '💾 Lưu bài viết';
        e.target.value = '';
        document.getElementById('imageUrl').value = '';
    }
}
