#!/bin/bash

# Generate SSL certificates for localhost development
# This script creates self-signed certificates that work with localhost

echo "Generating SSL certificates for localhost..."

# Create a config file for the certificate
cat > localhost.conf <<EOL
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=CA
L=San Francisco
O=Development
CN=localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
DNS.4 = ::1
IP.1 = 127.0.0.1
IP.2 = ::1
EOL

# Generate private key
openssl genrsa -out localhost.key 2048

# Generate certificate signing request
openssl req -new -key localhost.key -out localhost.csr -config localhost.conf

# Generate self-signed certificate
openssl x509 -req -in localhost.csr -signkey localhost.key -out localhost.pem -days 365 -extensions v3_req -extfile localhost.conf

# Clean up
rm localhost.conf localhost.csr

echo "SSL certificates generated:"
echo "  Private key: localhost.key"
echo "  Certificate: localhost.pem"
echo ""
echo "To use these certificates, add them to your .env file:"
echo 'SSL="true"'
echo 'SSL_KEY="./support/dev-ssl/localhost.key"'
echo 'SSL_CERT="./support/dev-ssl/localhost.pem"'
