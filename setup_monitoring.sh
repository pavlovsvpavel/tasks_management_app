#!/bin/bash

# --- CONFIGURATION ---
BASE_DIR="./monitoring"

echo "=========================================="
echo "   RESTARTING MONITORING STACK (NO ALERTS)"
echo "=========================================="

# 1. Clean up existing setup
echo "[1/6] Cleaning up old containers and volumes..."
# Attempt to down using the specific file if it exists, otherwise generic
if [ -f docker-compose-monitoring.yml ]; then
    docker compose -f docker-compose-monitoring.yml down -v 2>/dev/null || true
else
    docker compose down -v 2>/dev/null || true
fi
sudo rm -rf $BASE_DIR

# 2. Create Directory Structure
echo "[2/6] Creating directory structure..."
mkdir -p $BASE_DIR/grafana/provisioning/dashboards
mkdir -p $BASE_DIR/grafana/provisioning/datasources
mkdir -p $BASE_DIR/grafana/dashboards

# 3. Create Configuration Files

# --- Grafana Provisioning: Dashboards ---
echo "[3/6] Writing Grafana Dashboard Provisioning..."
cat <<EOF > $BASE_DIR/grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'Dashboards'
    orgId: 1
    folder: 'Monitoring'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# --- Grafana Provisioning: Datasources ---
echo "[3/6] Writing Grafana Datasource Provisioning..."
cat <<EOF > $BASE_DIR/grafana/provisioning/datasources/prometheus.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      timeInterval: 15s
EOF

# --- Grafana System Monitoring Dashboard JSON ---
echo "[3/6] Writing Grafana Dashboard JSON..."
cat <<EOF > $BASE_DIR/grafana/dashboards/system-monitoring.json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "panels": [
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "color": { "mode": "palette-classic" },
          "custom": { "drawStyle": "line", "fillOpacity": 10, "showPoints": "auto" },
          "thresholds": { "mode": "absolute", "steps": [{ "color": "green", "value": null }] }
        }
      },
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "id": 2,
      "options": { "legend": { "displayMode": "list", "placement": "bottom" } },
      "targets": [
        { "expr": "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)", "refId": "A", "legendFormat": "{{ instance }}" }
      ],
      "title": "CPU Usage (%)",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": { "color": { "mode": "palette-classic" } }
      },
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
      "id": 3,
      "targets": [
        { "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100", "refId": "A", "legendFormat": "{{ instance }}" }
      ],
      "title": "Memory Usage (%)",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
      "id": 4,
      "targets": [
        { "expr": "node_load1", "refId": "A", "legendFormat": "1min load" },
        { "expr": "node_load5", "refId": "B", "legendFormat": "5min load" },
        { "expr": "node_load15", "refId": "C", "legendFormat": "15min load" }
      ],
      "title": "System Load",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 },
      "id": 5,
      "targets": [
        { "expr": "(1 - (node_filesystem_avail_bytes{fstype!~\"tmpfs\"} / node_filesystem_size_bytes{fstype!~\"tmpfs\"})) * 100", "refId": "A", "legendFormat": "{{ mountpoint }}" }
      ],
      "title": "Disk Usage (%)",
      "type": "timeseries"
    },
    {
      "datasource": "Prometheus",
      "gridPos": { "h": 8, "w": 24, "x": 0, "y": 16 },
      "id": 6,
      "targets": [
        { "expr": "rate(node_network_receive_bytes_total{device!~\"lo|veth.*\"}[5m])", "refId": "A", "legendFormat": "RX {{ device }}" },
        { "expr": "rate(node_network_transmit_bytes_total{device!~\"lo|veth.*\"}[5m])", "refId": "B", "legendFormat": "TX {{ device }}" }
      ],
      "title": "Network Traffic",
      "type": "timeseries"
    }
  ],
  "refresh": "10s",
  "schemaVersion": 27,
  "style": "dark",
  "tags": ["system", "gcp", "monitoring"],
  "time": { "from": "now-1h", "to": "now" },
  "timezone": "",
  "title": "GCP VM System Monitoring",
  "uid": "gcp-system-monitoring",
  "version": 1
}
EOF

# 4. Generate Main Configs (Cleaned up)

echo "[4/6] Generating prometheus.yml (Main Config)..."
# Removed "rule_files" and "alerting" blocks
cat <<EOF > $BASE_DIR/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

echo "[5/6] Generating docker-compose-monitoring.yml..."
# Re-creating the compose file WITHOUT Alertmanager
cat <<EOF > docker-compose-monitoring.yml
services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: always
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
    ports:
      - "9100:9100"
    networks:
      - tasks-network

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    volumes:
      - $BASE_DIR/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    ports:
      - "9090:9090"
    depends_on:
      - node-exporter
    networks:
      - tasks-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_SERVER_ROOT_URL=https://tasks-app.win/monitoring/
      - GF_SERVER_SERVE_FROM_SUB_PATH=true
    volumes:
      - grafana_data:/var/lib/grafana
      # Load Dashboards and Datasources automatically
      - $BASE_DIR/grafana/provisioning:/etc/grafana/provisioning
      - $BASE_DIR/grafana/dashboards:/var/lib/grafana/dashboards
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    networks:
      - tasks-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  tasks-network:
    external: true
    name: tasks_management_app_tasks-network
EOF

# 6. Set Permissions
echo "[6/6] Setting permissions..."
# Grafana container runs as user 472, so we need to ensure it can read the files
chmod -R 755 $BASE_DIR
# Specifically for Grafana dashboards/provisioning
chmod -R 777 $BASE_DIR/grafana

echo "=========================================="
echo "   SETUP COMPLETE - STARTING SERVICES"
echo "=========================================="

docker compose -f docker-compose-monitoring.yml up -d --build

echo ""
echo "✅ Monitoring stack is up (Without Alertmanager)!"
