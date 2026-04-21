# frozen_string_literal: true

module WebhookEvents
  class WorkshopAttendanceStatus < WebhookEvents::Base
    attribute :status, type: String
    attribute :workshop, type: Hash

    def event_name
      'workshop_attendance_status'
    end

    def prepare_payload
      ctx = self.ctx || {}
      {
        status: ctx[:status],
        workshop: workshop_payload(ctx[:workshop])
      }
    end

    private

    def workshop_payload(workshop)
      {
        id: workshop&.id,
        name: workshop&.name,
        start_time: workshop&.start_time&.as_json,
        end_time: workshop&.end_time&.as_json
      }
    end
  end
end
