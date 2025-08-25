#!/bin/bash

# Generate SSL certificates for ttedev.me using mkcert
# This script creates certificates that are automatically trusted by browsers

echo "Generating SSL certificates for ttedev.me using mkcert..."

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install mkcert
        echo "Installing CA certificate..."
        mkcert -install
    else
        echo "Error: Homebrew not found. Please install mkcert manually:"
        echo "  brew install mkcert"
        echo "  mkcert -install"
        echo "  More info: https://github.com/FiloSottile/mkcert"
        exit 1
    fi
fi

# Change to the dev-ssl directory
cd "$(dirname "$0")"

# Generate certificate for ttedev.me
echo "Generating certificate for ttedev.me..."
mkcert -key-file ttedev.me.key -cert-file ttedev.me.pem ttedev.me "*.ttedev.me" localhost 127.0.0.1 ::1

echo ""
echo "SSL certificates generated successfully:"
echo "  Private key: ttedev.me.key"
echo "  Certificate: ttedev.me.pem"
echo ""
echo ""
echo "To use these certificates, add them to your .env file:"
echo 'SSL="true"'
echo 'SSL_KEY="./support/dev-ssl/ttedev.me.key"'
echo 'SSL_CERT="./support/dev-ssl/ttedev.me.pem"'
echo ""
echo "The certificate works for:"
echo "  - ttedev.me"
echo "  - *.ttedev.me (all subdomains)"
echo "  - localhost"
echo "  - 127.0.0.1"
echo "  - ::1"
