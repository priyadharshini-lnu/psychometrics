# Setting up local database for pgvector extension

## Install pgvector

The following command will build `pgvector` extension for `pg_config --version`

```bash
cd /tmp
git clone --branch v0.8.1 https://github.com/pgvector/pgvector.git
cd pgvector
make
make install
```

## Skills Embedding Rake Tasks

Generating embeddings for skills can be done via rake tasks.

### Generate embeddings for all skills

```bash
# Generate embeddings for skills that don't have them yet
bundle exec rake skills:embeddings:generate

# Generate embeddings for all skills (ignoring existing ones)
IGNORE_EXISTING=true bundle exec rake skills:embeddings:generate
```
