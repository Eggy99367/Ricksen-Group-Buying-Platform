# Ricksen Group Buying Platform

A full-stack platform for group buying (also known as team purchase), built with modular services including a web frontend, LINE Bot integration, and an image API. The project is containerized with Docker and orchestrated using `docker-compose`.

---

## Features

- Administrators can create and manage group buying activities  
- Consumers can browse and join group buying activities via LINE Bot  
- Order management for administrators, including logistics tracking  
- Image API for uploading and managing product images  
- Web interface for administrators to monitor activities and orders  
- Docker-based modular deployment with Nginx reverse proxy  

---

## Project Structure

```
Ricksen-Group-Buying-Platform/
├── img-api/          # Image API service
├── img-linebot/      # LINE Bot service
├── img-web/          # Web frontend
├── docker-compose.yml
├── nginx.conf
├── package-lock.json
└── other configs
```

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/)  
- [docker-compose](https://docs.docker.com/compose/)  

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Eggy99367/Ricksen-Group-Buying-Platform.git
cd Ricksen-Group-Buying-Platform

# 2. Start all services
docker-compose up -d

# 3. Verify containers are running
docker-compose ps
```

---

## Configuration

Set up environment variables before running the services. Suggested variables include:

| Variable | Description | Example |
|----------|-------------|---------|
| `LINE_CHANNEL_SECRET` | LINE Bot channel secret | `xxxxxx` |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Bot access token | `xxxxxx` |
| `DATABASE_URL` | Database connection string | `postgres://user:pass@host:5432/db` |
| `IMAGE_STORAGE_PATH` | Directory for storing uploaded images | `/data/images` |
| `PORT` | Port for API services | `3000` |

Create a `.env` file in each service directory as needed.

---

## Usage

1. **Administrator**  
   - Logs in to the **web interface**  
   - Creates new group buying activities (product details, target, deadline)  
   - Manages logistics and monitors all incoming orders  

2. **Consumer**  
   - Interacts with the **LINE Bot**  
   - Views all available/open group buying activities  
   - Places an order directly through the LINE Bot interface  

3. **Administrator (after orders)**  
   - Reviews all orders from the platform dashboard  
   - Handles order fulfillment and logistics management  

---

## Roadmap

The following items are planned or suggested improvements that are **not yet implemented**:

- Add authentication and role-based permissions  
- Multi-language support  
- Search, recommendation, and ranking features  
- UI/UX improvements  
- Performance optimization (caching, image compression, CDN)  
- Expand integrations beyond LINE  
