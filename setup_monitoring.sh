#!/bin/bash

# Setup script for Prometheus & Grafana monitoring on GCP VM
# This script initializes the monitoring stack and creates necessary directories

set -e

echo "================================"
echo "GCP VM Monitoring Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

print_success "Docker is installed"

# Create necessary directories
echo ""
echo "Creating monitoring directories..."

mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards

print_success "Directories created"

# Start monitoring services
echo ""
echo "Starting monitoring services..."
docker compose -f docker-compose-monitoring-prod.yml up -d

print_success "Monitoring services started"

# Wait for services to be ready
echo ""
echo "Waiting for services to start..."
sleep 5

# Check if services are running
echo ""
echo "Verifying services..."

services=("node-exporter" "prometheus" "grafana" "alertmanager")

for service in "${services[@]}"; do
    if docker ps | grep -q "$service"; then
        print_success "$service is running"
    else
        print_error "$service failed to start"
    fi
done

# Display access information
echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Access URLs:"
echo "  Grafana:      http://$(hostname -I | awk '{print $1}'):3000"
echo "  Prometheus:   http://$(hostname -I | awk '{print $1}'):9090"
echo "  AlertManager: http://$(hostname -I | awk '{print $1}'):9093"
echo "  Node Exporter: http://$(hostname -I | awk '{print $1}'):9100"
echo ""
echo "Grafana Credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
print_warning "⚠ IMPORTANT: Change the Grafana password in production!"
echo ""
echo "Next steps:"
echo "1. Open Grafana in your browser"
echo "2. Login with admin/admin"
echo "3. Change the admin password"
echo "4. Configure AlertManager notifications (optional)"
echo ""
echo "For more details, see MONITORING_SETUP.md"
echo ""

# Check for potential issues
echo ""
echo "Checking for potential issues..."

if ! docker compose -f docker-compose-monitoring-prod.yml logs prometheus | grep -q "Server started"; then
    print_warning "Prometheus may still be starting up..."
fi

if [ ! -f "monitoring/alertmanager.yml" ]; then
    print_warning "AlertManager configuration not found"
    print_warning "Alerts may not work properly"
fi

echo ""
print_success "Setup script completed!"
