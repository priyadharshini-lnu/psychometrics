# Steps to generate self signed certificate

```
openssl genrsa -out dev.key 2048
openssl rsa -in dev.key -out dev-key.pem
openssl req -new -key dev-key.pem -out dev-request.csr
openssl x509 -req -extensions v3_req -days 3650 -in dev-request.csr -signkey dev-key.pem -out dev-cert.pem -extfile ./openssl.cnf
```