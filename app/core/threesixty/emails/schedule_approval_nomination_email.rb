# frozen_string_literal: true

module Threesixty
  module Emails
    class ScheduleApprovalNominationEmail < BaseCommand
      private_attr_reader :campaign, :template

      def initialize(campaign, template, subject, evaluator)
        @campaign = campaign
        @subject = subject
        @evaluator = evaluator
        @template = template
      end

      def call
        hour = 20
        minutes = 0
        if template.schedule_time
          t = template.schedule_time.to_time
          hour = t.hour
          minutes = t.min
        end

        schedule_time = Time.current.change(hour: hour, min: minutes, sec: 59)
        schedule_time += 1.day if schedule_time < Time.current

        recipient_ids = Threesixty::Subjects::GetManagers.new(subject: @subject).query.map(&:user_id)

        scheduled = Threesixty::EmailSchedule.where('recipient_ids @> ?', recipient_ids.to_json).find_by(
          template_id: template.id,
          scheduled_date: schedule_time
        )

        return if scheduled

        Threesixty::Emails::Send.call!(
          Threesixty::Emails::Name::APPROVE_NOMINATION,
          threesixty_campaign: @campaign,
          subject: @subject,
          evaluator: @evaluator,
          scheduled_date: schedule_time
        )
      end
    end
  end
end
