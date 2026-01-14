package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

const dataFile = "data.json"

// NewsData cấu trúc dữ liệu
type NewsData struct {
	News     []Article `json:"news"`
	Featured *Article  `json:"featured"`
	Trending []Article `json:"trending"`
	Latest   []Article `json:"latest"`
}

// Article cấu trúc bài viết
type Article struct {
	ID       int64  `json:"id"`
	Title    string `json:"title"`
	Category string `json:"category"`
	ImageURL string `json:"imageUrl"`
	Author   string `json:"author"`
	Excerpt  string `json:"excerpt"`
	Content  string `json:"content"`
	Featured bool   `json:"featured"`
	Date     string `json:"date"`
	Views    int    `json:"views"`
}

func main() {
	// API endpoints
	http.HandleFunc("/api/news", handleNews)

	// File server cho các file tĩnh
	http.Handle("/", http.FileServer(http.Dir(".")))

	// Khởi động server
	port := ":8080"
	fmt.Printf("Server đang chạy tại http://localhost%s\n", port)
	fmt.Println("Nhấn Ctrl+C để dừng server")

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}

// handleNews xử lý GET và POST cho dữ liệu tin tức
func handleNews(w http.ResponseWriter, r *http.Request) {
	// Cho phép CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == "GET" {
		// Đọc dữ liệu từ file
		data, err := os.ReadFile(dataFile)
		if err != nil {
			// Nếu file không tồn tại, trả về dữ liệu rỗng
			emptyData := NewsData{News: []Article{}}
			json.NewEncoder(w).Encode(emptyData)
			return
		}
		w.Write(data)
	} else if r.Method == "POST" {
		// Lưu dữ liệu vào file
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Không thể đọc dữ liệu", http.StatusBadRequest)
			return
		}

		// Validate JSON
		var newsData NewsData
		if err := json.Unmarshal(body, &newsData); err != nil {
			http.Error(w, "Dữ liệu JSON không hợp lệ", http.StatusBadRequest)
			return
		}

		// Lưu vào file với định dạng đẹp
		prettyJSON, err := json.MarshalIndent(newsData, "", "  ")
		if err != nil {
			http.Error(w, "Lỗi khi format JSON", http.StatusInternalServerError)
			return
		}

		if err := os.WriteFile(dataFile, prettyJSON, 0644); err != nil {
			http.Error(w, "Không thể lưu file", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Lưu thành công"})
	} else {
		http.Error(w, "Method không được hỗ trợ", http.StatusMethodNotAllowed)
	}
}
