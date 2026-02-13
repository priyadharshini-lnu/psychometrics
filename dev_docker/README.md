# Production docker environment for devs

This folder contains resources for running the puma worker in production mode, sidekiq and minio inside containers.

## Usage

### Prerequisites
- Ensure some container engine like docker/Orbstack is installed and running on your machine.
- If you're using orbstack, you might need some additional configurations to make the docker client interact with it 
instead of the docker engine. Refer to Orbstack documentation for details.
- Install docker client libraries.
- Copy the ZscalerRootCA.pem file into this directory if you are using Zscaler. 
You can export this file from your browser by viewing the certificate and exporting it.
You can also export it from the keychain access app on macOS.
- Set the necessary environment variables in a `psychometrics/dev_docker/.env.local` file based on the
`.env.local.sample` template.
- Make sure to have your db running on port as described in the `DATABASE_URL` env var in `.env.local`.
- Ensure you have redis running on port as described in the `REDIS_URL` env var in `.env.local`.
- Set the secret key base in the `config/secrets/production.yml` file as ```secret_key_base: <your_secret_key_base>```.
A secret key can be generated with the ``` rails secret ``` command.


### Starting the Environment

1. Build and start all services:
   ```
   cd path_to_psychometrics/dev_docker
   docker compose build
   docker compose up
   ```
   This will start:
   - `web`: The main app server
   - `worker`: Sidekiq background jobs
   - `minio`: S3-compatible storage 
   - `minio-init`: Initializes minio buckets (runs once)

2. Access the app at [http://localhost:3000](http://localhost:3000) and miniO console at 
[http://localhost:9001](http://localhost:9001).

## Troubleshooting
- If you are facing issues with the build, ensure your `.env.local` is correct and contains all required variables for rails and minio.
- If you encounter certificate issues, check the ZscalerRootCA.pem setup in the `dev_docker/Dockerfile`
- For MinIO issues, check logs for the `minio` and `minio-init` services.



