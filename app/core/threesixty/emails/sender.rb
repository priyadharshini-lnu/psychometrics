# frozen_string_literal: true

module Threesixty
  module Emails
    module Sender
      def send_subject_report_ready_email(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsSubjectReportReadySendable.call!(threesixty_campaign, subject)
        Threesixty::SubjectReportReadyMailer.send(subject).deliver_later
      end

      def send_subject_report_ready_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsManagerReportReadySendable.call!(threesixty_campaign, subject)
        Threesixty::Subjects::GetManagers.new(subject).includes(user).each do |manager|
          Threesixty::ManagerReportReadyMailer.send(manager).deliver_later
        end
      end

      def send_approve_report_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsApproveReportSendable.call!(threesixty_campaign)
        Threesixty::Subjects::GetManagers.new(subject).includes(user).each do |manager|
          Threesixty::ManagerReportReadyMailer.send(manager).deliver_later
        end
      end

      def send_nomination_approval_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsAppoveNominationSendable.call(threesixty_campaign)
        Threesixty::Subjects::GetManagers.new(subject).each do |manager|
          Threesixty::ApproveNominationMailer.send(manager).deliver_later
        end
      end

      def send_nomination_denied_email_to_subject(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsDeniedNominationSendable.call(threesixty_campaign)
        Threesixty::DeniedNominationMailer.send(subject).deliver_later
      end


      def send_request_approval_email_to_managers(threesixty_campaign, subject)
        return unless Threesixty::Emails::IsRequestApprovalSendable.call(threesixty_campaign)
        Threesixty::Subjects::GetManagers.new(subject).each do |manager|
          Threesixty::RequestNominationApprovalMailer.send(manager).deliver_later
        end
      end
    end
  end
end
