# frozen_string_literal: true

class Reports::PublishSnapshotHandler < AsyncResponseRequest::AsyncRequestHandler
  def call
    ::Reports::PublishSnapshot.call!(report, current_user)
    AuditLogModule.audit!(:publish, report, user: current_user)
    async_response.response_data = { data: serialized_report }
    broadcast :ok, async_response
  rescue StandardError => e
    async_response.response_data = { error: e.message }
    Rails.logger.error("Reports::PublishSnapshotHandler failed: #{e.class} #{e.message}")
    broadcast :invalid, async_response
  end

  private

  def report
    @report ||= ::Report.includes(pages: :modules).find(context.dig(:meta, :report_id))
  end

  def serialized_report
    ReportSerializer.new(context: { builder: true, include: '**' }).serialize(report.reload)
  end

  def async_response
    @async_response ||= AsyncResponseRequest::AsyncResponse.new(
      processing_status: :completed,
      response_type: :json,
      response_data: {}
    )
  end
end
