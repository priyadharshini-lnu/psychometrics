module Communications
  class OnSpecificDatetimeJob < ApplicationJob
    queue_as :communication

    def perform
      Communication.enabled.delivery_on_specific_datetime.
        joining { emails.outer }.where.has { emails.id.eq(nil) & (delivery_at <= Time.now) }.
        group(:id).find_each(batch_size: 100) do |communication|
        communication.selected_memberships.find_each(batch_size: 100) do |membership|
          communication.emails.create(membership_id: membership.id)
        end
      end
    end
  end
end
