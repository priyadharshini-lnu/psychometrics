# frozen_string_literal: true

module Threesixty
  module Emails
    class Send < BaseCommand
      private_attr_reader :type, :context

      CONFIG = [
        {
          condition_class: 'Threesixty::Emails::IsSubjectReportReadySendable',
          template_name: Threesixty::Emails::Name::SUBJECT_REPORT_READY,
          recipient: 'subject'
        },
        {
          condition_class: 'Threesixty::Emails::IsManagerReportReadySendable',
          template_name: Threesixty::Emails::Name::MANAGER_REPORT_READY,
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsApproveReportSendable',
          template_name: Threesixty::Emails::Name::APPROVE_REPORT,
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsApproveNominationSendable',
          template_name: Threesixty::Emails::Name::APPROVE_NOMINATION,
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsDeniedNominationSendable',
          template_name: Threesixty::Emails::Name::NOMINATION_DENIED,
          recipient: 'manager'
        },
        {
          condition_class: 'Threesixty::Emails::IsRequestApprovalSendable',
          template_name: Threesixty::Emails::Name::REQUEST_APPROVAL,
          recipient: 'manager'
        },
        {
          template_name: Threesixty::Emails::Name::EVALUATOR_REMINDER,
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

        Threesixty::Emails::GetRecipients.call!(config[:recipient], context).each do |recipient|
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

      def lookup_recipients(config)
        Threesixty::Emails::GetRecipients.call!(config[:recipient], context)
      end
    end
  end
end

