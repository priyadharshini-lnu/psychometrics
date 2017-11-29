module Communications
  class OtherTypeJob < ApplicationJob
    queue_as :communication

    def perform
      communications = Communication.enabled.other.specific_datetime.
        joining { emails.outer }.where.has { emails.id.eq(nil) & (delivery_at <= Time.now) }.
        group(:id)
      communications.find_each(batch_size: 10) do |communication|
        communication.emails_creating
      end
    end
  end
end
