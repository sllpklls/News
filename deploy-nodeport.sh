#!/bin/bash

echo "📦 Deploying News App to Kubernetes with NodePort..."

# Apply deployment and service
kubectl apply -f k8s-nodeport.yaml

echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=120s deployment/news-app

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Status:"
kubectl get deployment news-app
kubectl get pods -l app=news-app
kubectl get service news-app-service

echo ""
echo "🌐 Access your application:"
echo ""

# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
if [ -z "$NODE_IP" ]; then
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
fi

if [ -z "$NODE_IP" ]; then
    echo "⚠️  Cannot detect node IP automatically"
    echo "   Run: kubectl get nodes -o wide"
    echo "   Then access: http://<NODE_IP>:30080"
else
    echo "   🔗 http://$NODE_IP:30080"
fi

echo ""
echo "💡 Useful commands:"
echo "   View logs: kubectl logs -f deployment/news-app"
echo "   Scale: kubectl scale deployment news-app --replicas=3"
echo "   Delete: kubectl delete -f k8s-nodeport.yaml"
echo ""
