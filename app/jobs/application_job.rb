# frozen_string_literal: true

class ApplicationJob < ActiveJob::Base
  include Sidekiq::Throttled::Job
  include JobTracking
  include ControlException

  attr_accessor :request_id

  def serialize
    super.merge('request_id' => request_id)
  end

  def deserialize(job_data)
    super
    self.request_id = job_data['request_id']
  end

  around_enqueue do |job, block|
    job.request_id = Current.request_id
    if Current.super_admin_context?
      ActsAsTenant.without_tenant { block.call }
    else
      block.call
    end
  end

  around_perform do |job, block|
    Current.request_id = job.request_id
    tenant = ActsAsTenant.current_tenant
    logger.info "[Job] #{job.class.name} performing with tenant=#{tenant&.id}" if tenant
    block.call
  end

  def self.discard_on(exception)
    rescue_from exception do |error|
      logger.error "Discarded #{self.class} due to a #{exception}. The original exception was #{error.cause.inspect}."
    end
  end

  discard_on ActiveJob::DeserializationError
end
