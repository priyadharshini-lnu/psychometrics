# frozen_string_literal: true

module Threesixty
  module Emails
    class MergeMultipleEvaluatorEmailSchedules < BaseCommand
      def call
        email_schedules = Threesixty::EmailSchedule.where(
          delivered_at: nil,
          name: Threesixty::Emails::Name::CONSOLIDATED_EMAILS,
          consolidated: true, auto_triggered: true
        ).where('scheduled_date <= ?', Time.zone.now).select(
          :id, :name, :recipient_ids, :meta, :tenant_id, :threesixty_campaign_id, :template_id
        ).order(:id)

        email_schedule_grouped_by_recipients = email_schedules.group_by { |e| [e.name, e.recipient_ids] }.values
        email_schedule_grouped_by_recipients.each do |grouped_email_schedules|
          merge_email_schedules(grouped_email_schedules)
        end
      end

      def merge_email_schedules(email_schedules)
        return if email_schedules.length <= 1

        all_email_schedule_subject_ids = email_schedules.map do |email_schedule|
          email_schedule.meta['subject_ids']
        end.flatten

        email_schedule_to_keep, *email_schedules_to_deleted = email_schedules

        email_schedule_to_keep.meta['subject_ids'] = all_email_schedule_subject_ids
        email_schedule_to_keep.save!

        email_schedules_to_deleted.map(&:delete)
      end
    end
  end
end
