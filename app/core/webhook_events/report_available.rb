# frozen_string_literal: true

module WebhookEvents
  class ReportAvailable < WebhookEvents::Base
    attribute :report, type: Hash
    attribute :report_pdf, type: Hash

    def event_name
      'report_available'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        report: {
          id: ctx[:report]&.id,
          name: ctx[:report]&.name
        },
        report_pdf: {
          url: ctx[:user_report]&.pdf_file&.url(expires_in: 10.minutes),
          expiry_time: 10.minutes.from_now
        }
      }
    end
  end
end
