module Communications
  module ReminderType
    class NotStartedJob < ApplicationJob
      queue_as :communication

      def perform(communication)
        return if communication.stop_reminder_datetime && communication.stop_reminder_datetime <= DateTime.current
        memberships = membership_group_by_project_and_user(communication)

        memberships.each do |membership|
          communication.emails.create(membership_id: membership.first.id)
        end

        scheduled_next_job(communication)
      end

      private

      def scheduled_next_job(communication)
        communication.send_email_job.set(wait: communication.delivery_interval_duration).perform_later(communication)
      end

      def fetch_memberships(communication)
        communication.current_memberships.member_or_manager.
          joins(:assigns).where(assigns: { status: :not_started }).distinct
      end

      def membership_group_by_project_and_user(communication)
        fetch_memberships(communication).group_by { |member| [ member.client.project.id, member.user_id] }.values
      end
    end
  end
end
