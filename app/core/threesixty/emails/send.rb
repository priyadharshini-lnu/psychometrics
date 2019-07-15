# frozen_string_literal: true

module Threesixty
  module Emails
    class Send < BaseCommand
      CONFIG = [
        {
          condition_class: 'Threesixty::Emails::IsSubjectReportReadySendable',
          template_name: 'subject_report_ready',
          recipient: 'subject'
        },
        {
          condition_class: 'Threesixty::Emails::IsManagerReportReadySendable',
          template_name: 'manager_report_ready',
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsApproveReportSendable',
          template_name: 'approve_report',
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsApproveNominationSendable',
          template_name: 'approve_nomination',
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsDeniedNominationSendable',
          template_name: 'nomination_denied',
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsRequestApprovalSendable',
          template_name: 'request_approval',
          recipient: 'manager'
        },
        {
          template_name: 'evaluator_reminder',
          recipient: 'evaluators_with_pending_evaluations'
        }
      ].freeze

      def initialize(type, context)
        @type = type
        @context = context
      end

      def call
        config = CONFIG.find { |c| c[:template_name] == type }
        return unless config[:condition_class].nil? || config[:condition_class].constantize.call!(context)

        email_template = context[:threesixty_campaign].email_templates.find_by!(name: type)

        lookup_recipients(config).each do |recipient|
          user = recipient.user
          context_for_piped_text = context.merge(
            recipient: user,
            subject: context[:subject]&.user,
            evaluator: context[:evaluator]&.user
          ).compact

          body = Threesixty::PipedText::Perform.call!(email_template.content, context_for_piped_text)
          email_schedule_attributes = email_template.
            slice(:name, :subject, :from, :reply_to_email, :threesixty_campaign_id).
            merge(
              content: body,
              recipient_emails: [user.email],
              scheduled_date: 10.seconds.from_now
            )

          Threesixty::EmailSchedule.create!(email_schedule_attributes)
        end
      end

      private

      attr_reader :type, :context

      def lookup_recipients(config)
        return [context[:subject]] if config[:recipient] == 'subject'

        if config[:recipient] == 'manager'
          Threesixty::Subjects::GetManagers.new(context[:subject]).query.includes(:user)
        elsif config[:recipient] == 'evaluators_with_pending_evaluations'
          Threesixty::Subjects::GetEvaluatorsWithPendingEvaluations.new(
            context[:threesixty_campaign], context[:subject]
          )
        end
      end
    end
  end
end
