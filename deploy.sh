#!/bin/bash
set -e

# ─── NuroGym Coach — deploy.sh ────────────────────────────────────────────────
# Usage: ./deploy.sh [deploy|seed|build|quick|rebuild|backup|restore|help]
# Run ./deploy.sh help  (or -h / --help) for details.

# ─── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_NAME="nurogym-coach"
BACKUP_DIR="backups"
CHROMA_HEALTH_URL="http://localhost:8003/api/v1/heartbeat"
CHROMA_MAX_WAIT=120
DOCS_FOLDER="curriculum,memory"

# ─── Helper Functions ───────────────────────────────────────────────────────

info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH."
        exit 1
    fi
    if ! docker info &> /dev/null 2>&1; then
        error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    success "Docker is running."
}

check_env() {
    if [ ! -f .env ]; then
        error ".env file not found. Copy .env.example to .env and fill in your values."
        echo "  cp .env.example .env"
        exit 1
    fi
    success ".env file found."
}

check_docs() {
    local total=0
    IFS=',' read -ra DOC_FOLDERS <<< "$DOCS_FOLDER"
    for folder in "${DOC_FOLDERS[@]}"; do
        folder=$(echo "$folder" | xargs)
        if [ ! -d "$folder" ]; then
            error "$folder/ folder is missing."
            exit 1
        fi
        if [ -z "$(ls -A "$folder"/*.md 2>/dev/null)" ]; then
            error "$folder/ has no .md files."
            exit 1
        fi
        local c
        c=$(ls -1 "$folder"/*.md 2>/dev/null | wc -l)
        total=$((total + c))
    done
    success "Found $total markdown documents across RAG folders ($DOCS_FOLDER)."
}

check_config() {
    if [ -f "config/nurogym.json" ]; then
        success "Coach configuration found (config/nurogym.json)."
    elif [ -f "config/coach.sample.json" ]; then
        success "Coach configuration found (config/coach.sample.json)."
    else
        warn "No config/nurogym.json or config/coach.sample.json — verify COACH_CONFIG_PATH in .env."
    fi
}

wait_for_chromadb() {
    info "Waiting for ChromaDB to be ready..."
    local elapsed=0
    while [ $elapsed -lt $CHROMA_MAX_WAIT ]; do
        if curl -s "$CHROMA_HEALTH_URL" > /dev/null 2>&1; then
            success "ChromaDB is ready."
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
        echo -n "."
    done
    echo ""
    error "ChromaDB did not become ready within ${CHROMA_MAX_WAIT}s."
    exit 1
}

print_status() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  NuroCoach ($PROJECT_NAME) — Deployment Complete${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Frontend:  ${CYAN}http://localhost:3003${NC}"
    echo -e "  ChromaDB:  ${CYAN}http://localhost:8003${NC}"
    echo ""
}

# ─── Commands ───────────────────────────────────────────────────────────────

cmd_deploy() {
    info "Starting full deployment..."
    echo ""

    check_docker
    check_env
    check_docs
    check_config

    info "Building Docker images..."
    docker compose build
    success "Images built."

    info "Starting ChromaDB..."
    docker compose up -d chromadb
    wait_for_chromadb

    info "Running document seeding (embedding into ChromaDB)..."
    docker compose run --rm seed
    success "Documents seeded."

    info "Starting frontend..."
    docker compose up -d frontend
    success "Frontend started."

    print_status
}

cmd_seed() {
    info "Re-seeding documents into ChromaDB..."
    echo ""

    check_docker
    check_env
    check_docs

    # Ensure ChromaDB is running
    if ! curl -s "$CHROMA_HEALTH_URL" > /dev/null 2>&1; then
        info "ChromaDB is not running. Starting it..."
        docker compose up -d chromadb
        wait_for_chromadb
    else
        success "ChromaDB is already running."
    fi

    info "Running seed operation..."
    docker compose run --rm seed
    success "Documents re-seeded successfully."

    local count=0
    IFS=',' read -ra DOC_FOLDERS <<< "$DOCS_FOLDER"
    for folder in "${DOC_FOLDERS[@]}"; do
        folder=$(echo "$folder" | xargs)
        if [ -d "$folder" ]; then
            local c
            c=$(ls -1 "$folder"/*.md 2>/dev/null | wc -l)
            count=$((count + c))
        fi
    done
    info "$count markdown files processed (across $DOCS_FOLDER)."
}

cmd_build() {
    info "Building Docker images..."
    echo ""

    check_docker

    docker compose build
    success "Docker images built successfully."
}

cmd_rebuild() {
    info "Full rebuild: stopping services, rebuilding from scratch, redeploying..."
    echo ""

    check_docker
    check_env
    check_docs
    check_config

    info "Stopping all services..."
    docker compose down
    success "Services stopped."

    info "Rebuilding images (no cache)..."
    docker compose build --no-cache
    success "Images rebuilt."

    info "Starting ChromaDB..."
    docker compose up -d chromadb
    wait_for_chromadb

    info "Running document seeding..."
    docker compose run --rm seed
    success "Documents seeded."

    info "Starting frontend..."
    docker compose up -d frontend
    success "Frontend started."

    print_status
}

cmd_backup() {
    info "Creating backup..."
    echo ""

    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/${PROJECT_NAME}_backup_${timestamp}.tar.gz"

    mkdir -p "$BACKUP_DIR"

    local files_to_backup=""

    if [ -d chromadb ]; then
        files_to_backup="$files_to_backup chromadb"
    else
        warn "chromadb/ directory not found — skipping vector database backup."
    fi

    IFS=',' read -ra DOC_FOLDERS <<< "$DOCS_FOLDER"
    for folder in "${DOC_FOLDERS[@]}"; do
        folder=$(echo "$folder" | xargs)
        if [ -d "$folder" ]; then
            files_to_backup="$files_to_backup $folder"
        else
            warn "$folder/ directory not found — skipping."
        fi
    done

    if [ -d "config" ]; then
        files_to_backup="$files_to_backup config"
    else
        warn "config/ directory not found — skipping config backup."
    fi

    if [ -f .env ]; then
        files_to_backup="$files_to_backup .env"
    else
        warn ".env file not found — skipping."
    fi

    if [ -z "$files_to_backup" ]; then
        error "Nothing to backup."
        exit 1
    fi

    info "Backing up:$files_to_backup"
    tar -czf "$backup_file" $files_to_backup

    local size
    size=$(du -h "$backup_file" | cut -f1)
    success "Backup created: $backup_file ($size)"
}

cmd_restore() {
    local backup_file="$1"

    if [ -z "$backup_file" ]; then
        echo ""
        info "Available backups:"
        if [ -d "$BACKUP_DIR" ] && [ -n "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
            ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $NF " (" $5 ")"}'
            echo ""
            error "Usage: ./deploy.sh restore <backup-file>"
        else
            warn "No backups found in $BACKUP_DIR/"
        fi
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi

    info "Restoring from: $backup_file"
    echo ""

    warn "This will overwrite current chromadb/, curriculum/, memory/, config/, and .env (if present in archive)."
    local confirm=""
    if [ "${DEPLOY_RESTORE_YES:-}" = "1" ] || [ "${DEPLOY_RESTORE_YES:-}" = "yes" ]; then
        confirm=y
        info "Non-interactive restore (DEPLOY_RESTORE_YES=$DEPLOY_RESTORE_YES)."
    else
        read -p "Continue? (y/N): " confirm
    fi
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        info "Restore cancelled."
        exit 0
    fi

    info "Stopping services..."
    docker compose down 2>/dev/null || true

    info "Extracting backup..."
    tar -xzf "$backup_file"
    success "Backup restored."

    info "Restarting services..."
    docker compose up -d chromadb
    wait_for_chromadb
    docker compose up -d frontend
    success "Services restarted."

    print_status
}

cmd_help() {
    echo ""
    echo -e "${CYAN}NuroCoach — ${PROJECT_NAME}${NC}"
    echo -e "${CYAN}deploy.sh — Docker deployment, seed, backup, and restore${NC}"
    echo ""
    echo "Usage: ./deploy.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  deploy    Full deployment: build images, start ChromaDB, seed RAG docs, start frontend"
    echo "  seed      Re-embed curriculum/ + memory/ into ChromaDB (requires Docker + .env)"
    echo "  build     Build Docker images (incremental / cached — fast for routine changes)"
    echo "  quick     Same as build — quick image build without starting containers"
    echo "  rebuild   docker compose down; build --no-cache; seed; start frontend (slow, clean)"
    echo "  backup    Tar.gz: chromadb/, curriculum/, memory/, config/, .env → backups/"
    echo "  restore   Extract a backup archive; restarts ChromaDB + frontend (see below)"
    echo "  help      Show this message (also: -h, --help, or no arguments)"
    echo ""
    echo "Restore:"
    echo "  ./deploy.sh restore path/to/${PROJECT_NAME}_backup_YYYYMMDD_HHMMSS.tar.gz"
    echo "  Lists backups/ if you omit the file path. Confirms before overwriting unless:"
    echo "    DEPLOY_RESTORE_YES=1 ./deploy.sh restore <file>   # CI / scripted restore"
    echo ""
    echo "Prerequisites: Docker running; .env from .env.example (GOOGLE_API_KEY for seed)."
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh deploy"
    echo "  ./deploy.sh quick"
    echo "  ./deploy.sh seed"
    echo "  ./deploy.sh backup"
    echo "  ./deploy.sh restore backups/${PROJECT_NAME}_backup_20260224_120000.tar.gz"
    echo ""
}

# ─── Main ───────────────────────────────────────────────────────────────────

case "${1:-help}" in
    deploy)  cmd_deploy ;;
    seed)    cmd_seed ;;
    build|quick) cmd_build ;;
    rebuild) cmd_rebuild ;;
    backup)  cmd_backup ;;
    restore) cmd_restore "$2" ;;
    help|-h|--help) cmd_help ;;
    *)
        error "Unknown command: $1"
        cmd_help
        exit 1
        ;;
esac
