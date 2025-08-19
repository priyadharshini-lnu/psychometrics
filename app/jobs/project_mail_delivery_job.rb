# frozen_string_literal: true

class ProjectMailDeliveryJob < ActionMailer::MailDeliveryJob
  include Sidekiq::Throttled::Job

  class << self
    # Cache MailerRateLimit results per unique argument set (the mail method
    # arguments after the first three ActionMailer-specific values). Thread-local
    # cache avoids repeated DB queries while the job is evaluated across
    # different throttle lambdas within the same worker thread.
    def limits_for(*args)
      Thread.current[:mailer_rate_limit_cache] ||= {}
      cache_key = args.hash
      Thread.current[:mailer_rate_limit_cache][cache_key] ||= MailerRateLimit.for(*args)
    end
  end

  sidekiq_throttle(
    concurrency: {
      limit: ->(*job_args) { limits_for(*job_args.drop(3))[:concurrency_limit] },
      key_suffix: ->(*job_args) { limits_for(*job_args.drop(3))[:key_suffix] }
    },
    threshold: {
      limit: ->(*job_args) { limits_for(*job_args.drop(3))[:rate_limit] },
      period: ->(*job_args) { limits_for(*job_args.drop(3))[:rate_period] },
      key_suffix: ->(*job_args) { limits_for(*job_args.drop(3))[:key_suffix] }
    }
  )
end
