require 'chronic'
module Communications
  class IfNotStartedJob < ApplicationJob
    queue_as :communication

    def communication_scope
      Communication.enabled.delivery_if_not_started
    end

    def perform
      communication_scope.find_each(batch_size: 100) do |communication|
        selected_membership_ids = communication.selected_memberships.pluck(:id)
        delivery_interval_datetime = Chronic.parse("#{communication.delivery_interval} ago")
        Membership.join_user.
          joining { assigns.on((assigns.membership_id == id) & (assigns.assessment_id == communication.assessment_id)) }.
          joining { communication_emails.outer.on((communication_emails.membership_id == id) & (communication_emails.communication_id == communication.assessment_id)) }.
          where('"communication_emails"."id" IS NOT NULL AND "communication_emails"."created_at" <= ? OR
            "communication_emails"."id" IS NULL AND "assigns"."created_at" <= ? ', delivery_interval_datetime, delivery_interval_datetime).
          where(id: selected_membership_ids).find_each(batch_size: 100) do |membership|
          communication.emails.create(membership_id: membership.id)
        end
      end
    end
  end
end
