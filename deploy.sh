#!/bin/bash

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t news-app:latest .

# Tag image (replace with your registry)
# docker tag news-app:latest your-registry/news-app:latest

# Push to registry (uncomment if using remote registry)
# docker push your-registry/news-app:latest

echo "✅ Docker image built successfully!"

# Apply Kubernetes manifests
echo "☸️  Deploying to Kubernetes..."
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-ingress.yaml

echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/news-app

echo "✅ Deployment completed!"
echo ""
echo "📊 Deployment status:"
kubectl get pods -l app=news-app
kubectl get svc news-app-service
echo ""
echo "🌐 Access your app:"
echo "   Local: kubectl port-forward svc/news-app-service 8080:80"
echo "   Then visit: http://localhost:8080"
