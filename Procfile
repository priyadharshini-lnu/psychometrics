web: bundle exec puma -t 5:5 -p ${PORT:-3000} -e ${RACK_ENV:-development}
worker: DB_POOL=${SIDEKIQ_CONCURRENCY:-2} bundle exec sidekiq -C config/sidekiq.yml
release: rake db:migrate
