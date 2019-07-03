module Threesixty
  class Subject < ApplicationRecord
    include Threesixty::Participatable

    has_many :participants, foreign_key: :subject_id, primary_key: :user_id
    belongs_to :self_evaluator, foreign_key: :user_id, primary_key: :user_id, inverse_of: :self_subject, class_name: 'Threesixty::Evaluator'
    has_many :subjects_relationships, primary_key: :user_id

    enum report_approval_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :report
    enum report_release_status: { waiting: 0, released: 1, on_hold: 2}, _prefix: :report_status
    enum evaluation_status: { in_progress: 0, completed: 1 }, _prefix: :evaluation_status

    def evaluators
      participants.includes(:relationship, :subject, :evaluator).where(campaign_id: campaign_id)
    end
  end
end

module Threesixty
  module Subjects
    class GetManagers < Rectify::Query
      def initailize(subject)
        @subject = subject
      end

      def query
        Threesixty::Evaluator.
          joins(participants: :relationship).
          where(campaign_id: subject.campaign_id, participants: { subject_id: subject.id, relationships: { name: 'Manager' } })
      end
    end
  end
end

module Threesixty
  class GetSubjectsForSubjectsReminder
  attr_reader :threesixty_campaign, :subjects

  def initailize(threesixty_campaign)
    @threesixty_campaign = threesixty_campaign
    @subjects = Threesixty::Subject.where(campaign_id: threesixty_campaign.campaign_id).includes(:user)
  end

  def call
    subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
      subjects.map(&:user_id),
      threesixty_campaign
    )
    nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
      subjects.map(&:user),
      threesixty_campaign
    )
    valid_statuses =[Threesixty::Participants::GetStatus::COMPLETED, Threesixty::Participants::GetStatus::DONE]
    subjects.select do |subject|
      nomination_requirement[subject.user_id]
      status = Threesixty::Participants::GetStatus.call!(
        subject,
        nomination_requirement_by_user_id[subject.user_id],
        subject_evaluator_counters[subject.user_id]
      )
      valid_statuses.include?(status)
    end
  end
end

module Threesixty
  class GetEvaluatorsForEvaluatorsReminder
    attr_reader :threesixty_campaign, :evaluators

    def initailize(threesixty_campaign)
      @threesixty_campaign = threesixty_campaign
      @evaluators = Threesixty::Evaluator.where(campaign_id: threesixty_campaign.campaign_id).includes(:user)
    end

    def call
      subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
        evaluators.map(&:user_id),
        threesixty_campaign
      )
      nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
        evaluators.map(&:user),
        threesixty_campaign
      )
      valid_statuses =[Threesixty::Participants::GetStatus::COMPLETED, Threesixty::Participants::GetStatus::DONE]

      evaluators.select do |subject|
        nomination_requirement[subject.user_id]
        status = Threesixty::Participants::GetStatus.call!(
          subject,
          nomination_requirement_by_user_id[subject.user_id],
          subject_evaluator_counters[subject.user_id]
        )
        valid_statuses.include?(status)
      end
    end
  end
end

module Threesixty
  module Subjects
    class IsSubjectReportReadyMailSendable
      def initailize(threesixty_campaign, subject)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        return broadcast :ok, false unless inform_subject_about_report_ready?
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [subject.user_id],
          threesixty_campaign
        )
        status = Threesixty::Participants::GetReportStatus.call(
          subject,
          threesixty_campaign.option,
          subject_evaluator_counters[subject.user_id]
        )
        broadcast :ok, status == Threesixty::Participants::GetReportStatus::AVAILABLE
      end

      private

      def inform_subject_about_report_ready?
        option = threesixty_campaign.option.reports
        option.dig(:access, :self_can_access) &&
        option.dig(:availability, :email_subject_when_report_available) && (
          option.dig(:availability, :report_available_to_subject_on_criteria) ||
          option.dig(:approval, :manager_approves_reports) ||
          option.dig(:approval, :administrator_approves_reports)
        )
      end
    end
  end
end

module Threesixty
  module Subjects
    class IsManagerReportReadyMailSendable
      attr_reader :threesixty_campaign, :subject

      def initailize(threesixty_campaign, subject)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        return broadcast :ok, false unless inform_manager_about_nomination?
        return broadcast :ok, false unless subject.report_waiting?
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [subject.user_id],
          threesixty_campaign
        )
        broadcast :ok, Threesixty::Reports::ResolveReleaseCondition.call!(
          subject,
          threesixty_campaign.option,
          subject_evaluator_counters[subject.user_id]
        )
      end

      private

      def inform_manager_about_nomination?
        option = threesixty_campaign.option.reports
        option.dig(:access, :manager_can_access) &&
        option.dig(:availability, :email_manager_when_report_available) && (
          option.dig(:availability, :report_available_to_subject_on_criteria) ||
          option.dig(:approval, :administrator_approves_reports)
        )
      end
    end
  end
end


module Theesixty
  module Subjects
    class IsAppoveReportMailSendable
      def initailize(threesixty_campaign, subject)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        broadcast :ok, inform_manager_about_report_approval?
      end

      private

      def inform_manager_report_approval?
        option = threesixty_campaign.option.reports
        option.dig(:approval, :manager_approves_reports) &&
        option.dig(:approval, :email_manager_when_report_ready_for_approval)
      end
    end
  end
end


module Threesixty
  module Subjects
    class IsAppoveNominationMailSendable
      attr_reader :threesixty_campaign

      def initailize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        broadcast :ok, inform_manager_about_nomination?
      end

      private

      def inform_manager_about_nomination?
        option = threesixty_campaign.option.participants
        option.dig(:subject ,:can_nominate_evaluators) &&
        option.dig(:manager, :can_approve_nominations) &&
        option.dig(:manager, :email_managers_on_nomination_approval)
      end
    end
  end
end

module Threesixty
  class IsNominationDeniedMailSendable
    def initailize(threesixty_campaign)
      @threesixty_campaign = threesixty_campaign
    end

    def call
      option = threesixty_campaign.option
      is_valid = option.dig(:subject ,:can_nominate_evaluators) && option.dig(:manager, :can_approve_nominations) &&
      option.dig(:manager, :email_subject_when_manager_declines_nomination)
      boradcast :ok, is_valid
    end
  end
end

module Threesixty
  class IsRequestApprovalMaiSendable
    def initailize(threesixty_campaign)
      @threesixty_campaign = threesixty_campaign
    end

    def call
      boradcast :ok, can_request_approval_from_manager?
    end

    private

    def can_request_approval_from_manager?
      option = threesixty_campaign.option.participants
      option.dig(:subject ,:can_nominate_evaluators) &&
      option.dig(:manager, :can_approve_nominations) &&
      option.dig(:manager, :subjects_can_email_managers)
    end
  end
end
