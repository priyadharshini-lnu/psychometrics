# frozen_string_literal: true

module Communications
  class WorkshopUpcomingReminderJob < ApplicationJob
    queue_as :communication

    def perform
      # Will send two reminders. First on 2 days before the workshop starts and other on 1 day before workshop.
      day_range_for_reminder = (1.day.from_now.beginning_of_day...3.days.from_now.beginning_of_day)
      Communication.workshop_upcoming_reminder.joins(workshops: %i[workshop_subjects workshop_invited_subjects]).
        where(workshop_invited_subjects: { status: :accepted }).
        where(workshops: { start_time: day_range_for_reminder }, workshop_subjects: { scheduling_status: :scheduled }).
        where.not(workshops: { status: :closed }).
        select('DISTINCT workshop_subjects.id workshop_subject_id, communications.*').
        find_each do |communication|
          workshop_subject = WorkshopSubject.find(communication.workshop_subject_id)

          communication.emails.create!(
            campaign_user: workshop_subject.campaign_user,
            workshop_id: workshop_subject.workshop_id,
            workshop_invite: workshop_subject.workshop_invite
          )
        end
    end
  end
end
