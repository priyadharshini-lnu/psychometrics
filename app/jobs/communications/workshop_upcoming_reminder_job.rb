# frozen_string_literal: true

module Communications
  class WorkshopUpcomingReminderJob < ApplicationJob
    queue_as :communication

    def perform
      send_legacy_workshop_upcoming_reminders
      send_delivery_workshop_upcoming_reminders
    end

    private

    def send_legacy_workshop_upcoming_reminders
      Communication.workshop_upcoming_reminder.find_each do |communication|
        day_range_for_reminder = reminder_range_for(communication)
        Communication.workshop_upcoming_reminder.
          where(id: communication.id).
          joins(workshops: %i[workshop_subjects]).
          where(workshops: { start_time: day_range_for_reminder }, workshop_subjects: { scheduling_status: :scheduled }).
          where.not(workshops: { status: :closed }).
          select('DISTINCT workshop_subjects.id workshop_subject_id, communications.*').
          find_each do |communication|
            workshop_subject = WorkshopSubject.find(communication.workshop_subject_id)

            # Only create email if assessment groups match
            next unless workshop_subject.workshop&.campaign_assessment_group_id ==
                        communication.campaign_assessment_group_id

            communication.emails.create(
              campaign_user: workshop_subject.campaign_user,
              workshop_id: workshop_subject.workshop_id,
              workshop_invite: workshop_subject.workshop_invite
            )
          end
      end
    end

    def send_delivery_workshop_upcoming_reminders
      CommunicationDelivery.joins(:communication_template, campaign: { workshops: :workshop_subjects }).
        where(communication_templates: { kind: :workshop_upcoming_reminder }, status: :active).
        find_each do |delivery|
          next unless delivery.client&.feature_enabled?(:use_new_communication_center)

          day_range_for_reminder = reminder_range_for(delivery)
          CommunicationDelivery.joins(campaign: { workshops: :workshop_subjects }).
            where(id: delivery.id).
            where(workshops: { start_time: day_range_for_reminder }, workshop_subjects: { scheduling_status: :scheduled }).
            where.not(workshops: { status: :closed }).
            select('DISTINCT workshop_subjects.id workshop_subject_id, communication_deliveries.*').
            find_each do |delivery|
              workshop_subject = WorkshopSubject.find(delivery.workshop_subject_id)

              next unless workshop_subject.workshop&.campaign_assessment_group_id == delivery.campaign_assessment_group_id

              CommunicationEmail.create!(
                communication_delivery: delivery,
                campaign_user: workshop_subject.campaign_user,
                workshop_id: workshop_subject.workshop_id,
                workshop_invite: workshop_subject.workshop_invite
              )
            end
        end
    end

    def reminder_range_for(record)
      offset = record.delivery_interval_duration
      return (1.day.from_now.beginning_of_day...3.days.from_now.beginning_of_day) unless offset

      today = Time.current.beginning_of_day
      (today + offset)..(today + 1.day + offset)
    end
  end
end
