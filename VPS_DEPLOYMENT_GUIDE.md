# VPS Deployment Guide for TDMS

This guide covers deploying the Thesis Defense Management System (Vite frontend + Node.js backend) to a Linux VPS (e.g., Ubuntu 20.04/22.04).

## Prerequisites
- A VPS running Ubuntu or Debian.
- SSH access to your server.
- A registered domain name pointing to your VPS IP address (optional but recommended).

---

## Step 1: Server Setup (Install Dependencies)

Connect to your VPS via SSH:
```bash
ssh user@your_vps_ip
```

Update packages and install dependencies (Node.js, NPM, Nginx, PM2):
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource for version 20.x or higher)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally (to keep your backend running in the background)
sudo npm install -g pm2
```

---

## Step 2: Transfer Your Code to the Server

You can bring your code to the server by cloning your GitHub repository, or using `scp` / `rsync`.

Assuming you place your files in `/var/www/tdms`:
```bash
sudo mkdir -p /var/www/tdms
sudo chown -R $USER:$USER /var/www/tdms

# If using Git:
git clone https://github.com/yourusername/thesis-defense-management-system.git /var/www/tdms
```

---

## Step 3: Backend Setup and Execution

Navigate to your backend nested directory:
```bash
cd /var/www/tdms/server

# Install backend dependencies
npm install

# Start the Node.js application using PM2
pm2 start index.js --name "tdms-backend"

# Ensure PM2 restarts on server reboot
pm2 startup
pm2 save
```

**Note on Database & Uploads**: Your backend uses SQLite (`tdms.db`) and saves files to the `uploads/` folder. Ensure the PM2 process user has write permissions to these files inside `/var/www/tdms/server/`.

---

## Step 4: Frontend Build

Navigate back to the project root:
```bash
cd /var/www/tdms

# Install frontend dependencies
npm install

# Build the Vite app
npm run build
```
This will compile your React files into the `dist/` directory, which Nginx will serve statically.

---

## Step 5: Configure Nginx Server Block

We will configure Nginx to serve the `dist/` folder and reverse-proxy all `/api` and `/uploads` requests to the Node.js backend.

Create a new config file:
```bash
sudo nano /etc/nginx/sites-available/tdms
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain_or_vps_ip;

    # The production frontend build directory
    root /var/www/tdms/dist;
    index index.html;

    # Serve the React application and handle frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the Node.js Backend
    # (Node.js runs on localhost:3001 inside the VPS, Nginx forwards external requests to it)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy Upload files directly to the Node.js Backend 
    # (Node serves them as express.static)
    location /uploads {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```
*(Replace `your_domain_or_vps_ip` with your actual domain name or the server's IP address).*

Save the file and exit (`CTRL+X`, `Y`, `ENTER`).

Enable the Nginx site and restart:
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/tdms /etc/nginx/sites-enabled/

# Test Nginx config for syntax errors
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx
```

---

## Step 6: Secure with Let's Encrypt SSL (Important for Production)

If you are using a Domain Name, secure your application with HTTPS:
```bash
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL Certificate
sudo certbot --nginx -d your_domain.com
```

---

## Step 7: How to Deploy Updates in the Future (Continuous Deployment Workflow)

When you make changes locally on your IDE, you need a workflow to push those changes to the VPS.

The most common and robust way to deploy ongoing changes is using **Git**. 

### 1. Push Changes from your Local IDE to GitHub
On your laptop (in VSCode or terminal):
```bash
git add .
git commit -m "Your update message"
git push origin main
```

### 2. Pull Changes on Content on the VPS
SSH into your VPS and navigate to the project directory:
```bash
cd /var/www/tdms

# Pull the latest changes from GitHub
git pull origin main
```

### 3. Apply the Updates

**If you updated Frontend code (React/Vite):**
```bash
# Reinstall packages just in case you added new dependencies
npm install

# Rebuild the production react files
npm run build
```
*Note: Because Nginx serves the static `dist/` folder, Nginx will automatically start serving the new UI immediately. No Nginx restart needed!*

**If you updated Backend code (Node.js/Express):**
```bash
# Navigate to the backend folder
cd server

# Install any new backend dependencies
npm install

# Restart the PM2 process to apply new backend code
pm2 restart tdms-backend
```

That's it! Your online application is now running the latest version of your code.
