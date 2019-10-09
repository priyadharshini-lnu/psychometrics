# frozen_string_literal: true

module Threesixty
  module Emails
    module Name
      SUBJECT_REPORT_READY = 'subject_report_ready'
      MANAGER_REPORT_READY = 'manager_report_ready'
      APPROVE_REPORT = 'approve_report'
      APPROVE_NOMINATION = 'approve_nomination'
      NOMINATION_DENIED = 'nomination_denied'
      REQUEST_APPROVAL = 'request_approval'
      EVALUATOR_INVITE = 'evaluator_invite'
      EVALUATOR_REMINDER = 'evaluator_reminder'
      SUBJECT_INVITE = 'subject_invite'
      SUBJECT_REMINDER = 'subject_reminder'
      CUSTOM_MESSAGE = 'custom_message'

      def self.evaluator_email?(email_name)
        [EVALUATOR_INVITE, EVALUATOR_REMINDER].include?(email_name)
      end

      def self.reminder_email?(email_name)
        [SUBJECT_REMINDER, EVALUATOR_REMINDER].include?(email_name)
      end

      def self.recipient_type(email_name)
        config = Threesixty::Emails::Send::CONFIG.find { |c| c[:template_name] == email_name }
        config&.dig(:recipient_type)
      end
    end
  end
end
