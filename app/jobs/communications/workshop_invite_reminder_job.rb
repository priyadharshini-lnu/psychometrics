# frozen_string_literal: true

module Communications
  class WorkshopInviteReminderJob < ApplicationJob
    queue_as :communication

    def perform(communication)
      campaign = communication.project_campaign
      # rubocop:disable Layout/MultilineMethodCallIndentation
      workshop_invited_subjects = WorkshopInvitedSubject.pending.
        joins(workshop_invite: :workshops).
        where(workshop_invites: { campaign_id: campaign.id }).
        where(%{
          workshops.total_seats > workshops.booked_seats AND
          NOW() < (
            workshops.start_time - (workshops.scheduling_lead_time * '1 second'::INTERVAL) - '8 hours'::INTERVAL
          )
        }).distinct
      # rubocop:enable Layout/MultilineMethodCallIndentation

      workshop_invited_subjects.find_each do |workshop_invited_subject|
        communication.emails.create!(
          campaign_user: workshop_invited_subject.campaign_user,
          workshop_invite_id: workshop_invited_subject.workshop_invite_id
        )
      end
      scheduled_next_job(communication)
    end

    private

    def scheduled_next_job(communication)
      communication.send_email_job.set(wait: communication.delivery_interval_duration).perform_later(communication)
    end
  end
end
