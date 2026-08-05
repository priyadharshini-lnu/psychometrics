# frozen_string_literal: true

class ActiveRecordAuditLogs::RecordHistorySearchHandler < AsyncResponseRequest::AsyncRequestHandler
  def call
    async_response.response_data = ActiveRecordAuditLogs::RecordHistorySearch.new(params).call

    broadcast :ok, async_response
  rescue ActiveRecordAuditLogs::HistoryDateRange::Error, Geo::Exceptions::RestrictedEndpoint => e
    async_response.response_data = e.message
    broadcast :invalid, async_response
  rescue StandardError => e
    async_response.response_data = 'Unable to load record history'
    Rails.logger.error("RecordHistorySearchHandler failed: #{e.class} #{e.message}")
    broadcast :invalid, async_response
  end

  private

  def async_response
    @async_response ||= AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :json,
      response_data: {}
    )
  end
end
