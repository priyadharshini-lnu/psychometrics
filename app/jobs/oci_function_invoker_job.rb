# frozen_string_literal: true

class OciFunctionInvokerJob < ApplicationJob
  queue_as :reports

  CONCURRENCY_LIMIT = 15
  FUNCTION_RATES = {
    url_to_pdf: 4,
    zip_s3_files: 0.5
  }.freeze

  # OCI total-concurrency-limit is 60 GB by default shared by functions in the region.
  # url_to_pdf uses 2 GB memory per function, zip_s3_files uses 1 GB.
  # At 15 concurrent :url_to_pdf, memory used = 30 GB; for :zip_s3_files, 15 GB.
  #
  # As we are using detached mode there would be more OCI functions running than 15
  # as job finishes early with 202 response in detached mode.
  # Keeping limit at 15 provides ~25% headroom for overlapping detached executions.
  # Adding the following rate limit to maintain the concurrent requests limitation.
  # Considering url_to_pdf takes 15s to complete, it can complete 4 requests in a minute.
  # Similarly, zip_s3_files takes 2 minutes to complete, so it can complete 0.5 requests in a minute.
  sidekiq_throttle(
    concurrency: {
      limit: CONCURRENCY_LIMIT,
      key_suffix: ->(function_identifier, *) { function_identifier }
    },
    threshold: {
      limit: lambda { |function_identifier, *|
        calculate_limit_for_function(function_identifier)
      },
      period: 1.minute,
      key_suffix: ->(function_identifier, *) { function_identifier }
    }
  )

  track_exceptions exception_classes: [OCI::Errors::ServiceError], consecutive_failure_count: 20

  retry_on Faas::Services::Oci::Exceptions::TooManyRequest, wait: :polynomially_longer, attempts: 10
  retry_on Faas::Services::Oci::Exceptions::IncorrectState, wait: :polynomially_longer, attempts: 5

  def perform(_function_identifier, invoke_endpoint, payload, options)
    Faas::Services::Oci.new(invoke_endpoint, options).invoke!(payload)
  end

  private

  def identfier_args
    {
      identifier: [self.class.name, arguments.first].join('/')
    }
  end

  class << self
    def calculate_limit_for_function(function_identifier)
      rate = FUNCTION_RATES[function_identifier.to_sym] || 1
      (rate * CONCURRENCY_LIMIT).to_i
    end
  end
end
