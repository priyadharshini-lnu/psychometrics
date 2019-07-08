# frozen_string_literal: true

module Threesixty
  module Emails
    module Sender
      def self.send_subject_report_ready_email(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsSubjectReportReadySendable.call!(threesixty_campaign, subject)
        Threesixty::SubjectReportReadyMailer.send_email(subject).deliver_later
      end

      def self.send_subject_report_ready_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsManagerReportReadySendable.call!(threesixty_campaign, subject)
        Threesixty::Subjects::GetManagers.new(subject).query.includes(:user).each do |manager|
          Threesixty::ManagerReportReadyMailer.send_email(manager).deliver_later
        end
      end

      def self.send_approve_report_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsApproveReportSendable.call!(threesixty_campaign, subject)
        Threesixty::Subjects::GetManagers.new(subject).query.includes(:user).each do |manager|
          Threesixty::ApproveReportMailer.send_email(manager).deliver_later
        end
      end

      def self.send_nomination_approval_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsAppoveNominationSendable.call!(threesixty_campaign)
        Threesixty::Subjects::GetManagers.new(subject).query.includes(:user).each do |manager|
          Threesixty::ApproveNominationMailer.send_email(manager).deliver_later
        end
      end

      def self.send_nomination_denied_email_to_subject(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsDeniedNominationSendable.call!(threesixty_campaign)
        Threesixty::DeniedNominationMailer.send_email(subject).deliver_later
      end


      def self.send_request_approval_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsRequestApprovalSendable.call!(threesixty_campaign)
        Threesixty::Subjects::GetManagers.new(subject).query.includes(:user).each do |manager|
          Threesixty::RequestNominationApprovalMailer.send_email(manager).deliver_later
        end
      end

      def self.send_evaluator_reminder_emails_for_subject(threesixty_campaign, subject)
        Threesixty::Subjects::GetEvaluatorsWithPendingEvaluations.new(threesixty_campaign, subject).each do |evaluator|
          Threesixty::EvaluatorReminderMailer.send_email(evaluator).deliver_later
        end
      end
    end
  end
end
