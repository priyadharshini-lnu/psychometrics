# frozen_string_literal: true

class ApplicationJob < ActiveJob::Base
  include Sidekiq::Throttled::Job
  include JobTracking
  include ControlException

  attr_accessor :request_id, :session_id, :application_component, :ip_address

  def serialize
    super.merge('request_id' => request_id, 'session_id' => session_id,
                'application_component' => application_component, 'ip_address' => ip_address)
  end

  def deserialize(job_data)
    super
    self.request_id = job_data['request_id']
    self.session_id = job_data['session_id']
    self.application_component = job_data['application_component']
    self.ip_address = job_data['ip_address']
  end

  around_enqueue do |job, block|
    job.request_id = Current.request_id
    job.session_id = Current.session_id
    job.application_component = Current.application_component
    job.ip_address = Current.ip_address
    block.call
  end

  around_perform do |job, block|
    Current.request_id = job.request_id
    Current.session_id = job.session_id
    Current.application_component = job.application_component
    Current.ip_address = job.ip_address
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
