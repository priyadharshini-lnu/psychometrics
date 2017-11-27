module Communications
  class NotStartedJob < ApplicationJob
    queue_as :communication

    def perform(communication_id)
      communication = Communication.enabled.find_by(id: communication_id)
      return unless communication
      memberships = fetch_memberships(communication)
      memberships.find_each do |membership|
        communication.emails.create(membership_id: membership.id)
      end

      scheduled_next_job(communication)
    end

    private

    def scheduled_next_job(communication)
      communication.send_email_job.set(wait: communication.delivery_interval_duration).perform_later(communication.id)
    end

    def fetch_memberships(communication)
      communication.current_memberships.member.joins(:assigns).where(assigns: { status: :not_started }).distinct
    end
  end
end
