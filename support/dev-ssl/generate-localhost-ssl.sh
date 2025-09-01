#!/bin/bash

# Generate SSL certificates for localhost development using mkcert

echo "Generating SSL certificates for localhost using mkcert..."

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

# Generate certificate for localhost
echo "Generating certificate for localhost..."
mkcert -key-file localhost.key -cert-file localhost.pem localhost "*.localhost" 127.0.0.1 ::1

echo ""
echo "SSL certificates generated successfully:"
echo "  Private key: localhost.key"
echo "  Certificate: localhost.pem"
echo ""
echo ""
echo "To use these certificates, add them to your .env file:"
echo 'SSL="true"'
echo 'SSL_KEY="./support/dev-ssl/localhost.key"'
echo 'SSL_CERT="./support/dev-ssl/localhost.pem"'
echo ""
echo "The certificate works for:"
echo "  - localhost"
echo "  - *.localhost (all subdomains)"
echo "  - 127.0.0.1"
echo "  - ::1"
