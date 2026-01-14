# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY main.go .

# Build the application
RUN go build -o news-server main.go

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/news-server .

# Copy static files
COPY index.html .
COPY article.html .
COPY editor.html .
COPY search.html .
COPY data.json .
COPY style/ ./style/
COPY script/ ./script/

# Expose port
EXPOSE 8080

# Run the application
CMD ["./news-server"]
