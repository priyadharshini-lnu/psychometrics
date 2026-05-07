# frozen_string_literal: true

module Mhs
  class GetEnrichmentResult < Base
    private_attr_reader :pdf_url, :enrichment_id

    def initialize(pdf_url, enrichment_id)
      @pdf_url = pdf_url
      @enrichment_id = enrichment_id
    end

    def call
      return broadcast(:error, 'No PDF URL provided') unless pdf_url

      response = client.get(pdf_url)

      if response.success?
        pdf_data = {
          content: response.body,
          filename: "enrichment_report_#{enrichment_id || 'unknown'}.pdf",
          content_type: 'application/pdf',
          size: response.body.bytesize,
          enrichment_id: enrichment_id,
          downloaded_at: Time.current.iso8601
        }
        broadcast :ok, pdf_data
      else
        handle_failure(response)
      end
    rescue StandardError => e
      handle_exception(e)
    end

    private

    def handle_failure(response)
      error_message = "Failed to download enrichment result. Status: #{response.status}"
      raise Mhs::Exceptions::GetEnrichmentResultFailed,
            "MHS::GetEnrichmentResult failed for URL: #{pdf_url}. Error: #{error_message}"
    end

    def handle_exception(exception)
      Sentry.capture_exception(exception, extra: {
        pdf_url: pdf_url,
        enrichment_id: enrichment_id
      })
      broadcast :error, exception.message
    end

    def extract_enrichment_id_from_url
      # Extract enrichment ID from URL pattern
      # Example: /enrichments/bf2375c6-6720-4653-a544-3e7fa8cd8674/instances/...
      match = pdf_url&.match(%r{enrichments/([^/]+)})
      match&.[](1)
    end
  end
end
