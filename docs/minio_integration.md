# MinIO Integration Guide

This guide explains how to set up and use MinIO as an S3-compatible storage service for local development.

## Prerequisites

- Rails application with Active Storage configured
- Either Docker or Homebrew installed

## 1. Start MinIO Server

### Option A: Using Docker
```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"
```

### Option B: Using Homebrew
```bash
# Install MinIO
brew install minio/stable/minio

# Install MinIO CLI
brew install minio/stable/mc

# Create data directory
mkdir -p ~/minio/data

# Start MinIO server
minio server ~/minio/data --console-address ":9001"

# To run in background
brew services start minio/stable/minio

# To stop the service
brew services stop minio/stable/minio
```

## 2. Create Buckets

### Option A: Using MinIO Console

1. Access MinIO Console:
   - Open http://localhost:9001
   - Login with:
     - Username: minioadmin
     - Password: minioadmin

2. Create required buckets:
   - s3-public-bucket
   - s3-private-bucket

### Option B: Using MinIO CLI

```bash
# Set up MinIO CLI alias
mc alias set local http://127.0.0.1:9000 minioadmin minioadmin

# Create the required buckets
mc mb local/s3-public-bucket
mc mb local/s3-private-bucket

# Set public download access for public bucket
mc anonymous set download local/s3-public-bucket
```

## 3. Configuration Files

### Update env file

```bash
S3_COMPATIBLE_STORAGE_PRIVATE_BUCKET="s3-private-bucket"
S3_COMPATIBLE_STORAGE_PROVIDER="minio"
S3_COMPATIBLE_STORAGE_PUBLIC_BUCKET="s3-public-bucket"
S3_COMPATIBLE_STORAGE_REGION="us-east-1"
S3_COMPATIBLE_STORAGE_ACCESS_KEY_ID="minioadmin"
S3_COMPATIBLE_STORAGE_SECRET_ACCESS_KEY="minioadmin"
S3_COMPATIBLE_STORAGE_ENDPOINT="http://localhost:9000"
PRIVATE_BUCKET_STORAGE_SERVICE_KEY='s3_private_bucket'
PUBLIC_BUCKET_STORAGE_SERVICE_KEY='s3_public_bucket'
```

## 4. Testing the Setup

In Rails console:
```ruby
# Test file upload
blob = ActiveStorage::Blob.create_and_upload!(
  io: StringIO.new("Test file content"),
  filename: "test.txt",
  content_type: "text/plain",
  service_name: "s3_public_bucket"
)

# Verify upload
puts "Upload successful!" if blob.persisted?
puts "URL: #{blob.url}"
```

## 5. Troubleshooting

### Common Issues

1. **Invalid Access Key Error**
   - Verify MinIO is running: `docker ps | grep minio`
   - Check credentials in settings_secrets.yml
   - Ensure MinIO console is accessible

2. **Bucket Not Found**
   - Verify bucket names match configuration
   - Check bucket creation in MinIO console

3. **Connection Issues**
   - Verify MinIO endpoints (9000 for API, 9001 for Console)
   - Check Docker container status

### Useful Commands

```bash
# Check MinIO status
docker ps | grep minio

# Restart MinIO
docker restart minio

# View MinIO logs
docker logs minio

# Stop MinIO
docker stop minio
```

## 6. References

- [MinIO Docker Documentation](https://min.io/docs/minio/container/index.html)
- [Active Storage Documentation](https://edgeguides.rubyonrails.org/active_storage_overview.html)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/sdk-for-ruby/v3/api/Aws/S3.html)
