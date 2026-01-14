# News App - Kubernetes Deployment Guide

## 📦 Build và Deploy

### Prerequisites
- Docker installed
- Kubernetes cluster (minikube, GKE, EKS, AKS, etc.)
- kubectl configured

### Quick Start

1. **Build Docker image:**
```bash
docker build -t news-app:latest .
```

2. **Test locally:**
```bash
docker run -p 8080:8080 news-app:latest
```
Truy cập: http://localhost:8080

3. **Deploy to Kubernetes:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

1. **Apply Kubernetes manifests:**
```bash
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-ingress.yaml
```

2. **Check deployment status:**
```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

3. **Access the app:**
```bash
# Port forward
kubectl port-forward svc/news-app-service 8080:80

# Or get LoadBalancer IP
kubectl get svc news-app-service
```

### Production Deployment

1. **Push image to registry:**
```bash
# Docker Hub
docker tag news-app:latest yourusername/news-app:v1.0.0
docker push yourusername/news-app:v1.0.0

# Google Container Registry
docker tag news-app:latest gcr.io/your-project/news-app:v1.0.0
docker push gcr.io/your-project/news-app:v1.0.0
```

2. **Update deployment image:**
```bash
kubectl set image deployment/news-app news-app=yourusername/news-app:v1.0.0
```

3. **Configure Ingress:**
   - Update `k8s-ingress.yaml` with your domain
   - Install cert-manager for SSL/TLS
   - Apply ingress configuration

### Scaling

```bash
# Scale up
kubectl scale deployment news-app --replicas=5

# Auto-scaling
kubectl autoscale deployment news-app --min=2 --max=10 --cpu-percent=80
```

### Monitoring

```bash
# View logs
kubectl logs -f deployment/news-app

# Describe pod
kubectl describe pod <pod-name>

# Resource usage
kubectl top pods
```

### Cleanup

```bash
kubectl delete -f k8s-deployment.yaml
kubectl delete -f k8s-ingress.yaml
```

## 🏗️ Architecture

- **Deployment**: 3 replicas for high availability
- **Service**: LoadBalancer type for external access
- **PVC**: Persistent storage for data.json
- **Resources**: 64Mi-128Mi memory, 100m-200m CPU
- **Health Checks**: Liveness & Readiness probes

## 📝 Configuration

### Environment Variables
Currently none required. Add to deployment if needed:
```yaml
env:
- name: PORT
  value: "8080"
```

### Persistent Storage
data.json is mounted via PVC for data persistence across pod restarts.

### Load Balancing
Service distributes traffic across 3 replicas.

## 🔒 Security

- Non-root user in container
- Resource limits enforced
- TLS/SSL via Ingress (configure cert-manager)

## 📊 Monitoring & Logging

Consider adding:
- Prometheus for metrics
- Grafana for visualization
- ELK/EFK stack for logging
