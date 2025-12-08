#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh

# Wait for nginx to be fully ready
sleep 5

# Check if certificate already exists
if sudo certbot certificates -d project-allenrs.is404.net 2>&1 | grep -q "project-allenrs.is404.net"; then
    echo "Certificate already exists, renewing if needed..."
    sudo certbot renew --nginx --quiet
else
    echo "Requesting new certificate..."
    # Try to get certificate, but don't fail deployment if it doesn't work
    sudo certbot -n -d project-allenrs.is404.net --nginx --agree-tos --email allenschultz05@gmail.com || {
        echo "Certbot failed, but continuing deployment. You can manually run certbot later."
        echo "Common reasons: DNS not propagated yet, domain not pointing to this server, or rate limiting."
        exit 0
    }
fi

# Reload nginx to pick up any cert changes
sudo systemctl reload nginx || true

exit 0