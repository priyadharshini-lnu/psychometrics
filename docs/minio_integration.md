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

1. Access MinIO Console:
   - Open http://localhost:9001
   - Login with:
     - Username: minioadmin
     - Password: minioadmin

2. Create required buckets:
   - s3-public-bucket
   - s3-private-bucket
3. Create access keys for the buckets

## 3. Configuration Files

### Update env file

```bash
S3_COMPATIBLE_STORAGE_ACCESS_KEY_ID=update-this-key-from-minio-console
S3_COMPATIBLE_STORAGE_SECRET_ACCESS_KEY=update-this-key-from-minio-console
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
