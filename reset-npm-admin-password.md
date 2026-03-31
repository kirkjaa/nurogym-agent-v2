# Reset Nginx Proxy Manager Admin Password (Docker + SQLite)

## Prerequisites

- NPM running via Docker with SQLite
- `sqlite3` installed on the host (`apt-get install -y sqlite3`)
- Know your NPM container name (e.g. `nginx-proxy-manager-app-1`)

## Find the Data Volume Mount

```bash
docker inspect nginx-proxy-manager-app-1 --format '{{ range .Mounts }}{{ .Source }} -> {{ .Destination }}{{ println }}{{ end }}'
```

Example output:

```
/root/docker/nginx-proxy-manager/data -> /data
/root/docker/nginx-proxy-manager/letsencrypt -> /etc/letsencrypt
```

## Step 1: Mark All Users as Deleted

```bash
sqlite3 /root/docker/nginx-proxy-manager/data/database.sqlite "UPDATE user SET is_deleted=1;"
```

## Step 2: Restart the Container

```bash
docker restart nginx-proxy-manager-app-1
```

This triggers NPM to create a fresh default admin user on startup.

## Step 3: Log In with Default Credentials

- **Email:** `admin@example.com`
- **Password:** `changeme`

NPM will immediately prompt you to set a new password for this temporary admin.

## Step 4: Restore Original Users

```bash
sqlite3 /root/docker/nginx-proxy-manager/data/database.sqlite "UPDATE user SET is_deleted=0;"
```

## Step 5: Reset Your Original Admin Password

1. From the NPM UI (logged in as the temp admin), navigate to **Users**
2. Reset your original admin user's password

## Step 6: Clean Up

1. Log out of the temporary admin
2. Log in as your original admin
3. Delete the `admin@example.com` temporary user

## Troubleshooting

### `sqlite3` not found in the container

The NPM Docker image may not include `sqlite3` or a package manager (`apk`/`apt-get`). Install `sqlite3` on the **host** instead and operate on the database file directly via the volume mount.

```bash
apt-get install -y sqlite3
```

### Finding your container name

```bash
docker ps --format "table {{.Names}}\t{{.Image}}" | grep nginx
```
