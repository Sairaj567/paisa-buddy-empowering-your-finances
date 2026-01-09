#!/bin/bash
# Oracle Cloud Deployment Script for Paisa Buddy
# Run this on your Oracle Cloud instance after SSH-ing in

# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Open firewall ports (Ubuntu)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# Create web directory
sudo mkdir -p /var/www/paisa-buddy
sudo chown -R $USER:$USER /var/www/paisa-buddy

# Create Nginx config
sudo tee /etc/nginx/sites-available/paisa-buddy > /dev/null <<EOF
server {
    listen 80;
    server_name _;  # Replace with your domain or IP
    
    root /var/www/paisa-buddy;
    index index.html;
    
    # Handle React Router (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/paisa-buddy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Server ready! Now upload your dist folder contents to /var/www/paisa-buddy"
