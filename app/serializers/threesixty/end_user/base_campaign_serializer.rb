# frozen_string_literal: true

module Threesixty
  module EndUser
    class BaseCampaignSerializer < Panko::Serializer
      attributes :assessment_name, :type, :nominations_counters, :evaluations_counters, :reports_counters

      def assessment_name
        object.assessment.name
      end

      def type
        ::Campaign::THREESIXTY
      end

      def nominations_counters
        {
          total_nominations: nomination_subjects.count,
          completed_nominations: Threesixty::Subjects::IsNominationRequirementComplete.
            call!(object, nomination_subjects.map(&:user)).count { |_, v| v }
        }
      end

      def evaluations_counters
        Threesixty::Participants::CalcCounters.call!([current_user.id], object)[current_user.id]
      end

      def reports_counters
        if object.option.reports.dig('approval', 'manager_approves_reports')
          completed_reports = Threesixty::Subject.where(
            user_id: user_reports.map(&:user_id), campaign_id: object.campaign_id, report_approval_status: :approved
          ).count
        else
          completed_reports = reports.count
        end
        {
          total_reports: user_reports.count,
          completed_reports: completed_reports
        }
      end

      def nomination_subjects
        ::Threesixty::NominationsByUserQuery.new(object, current_user, all_managed_subjects)
      end

      def evaluations
        ::Threesixty::EvaluationsByUserQuery.new(object, current_user)
      end

      def user_reports
        ::Threesixty::UsersReportsQuery.new(object, all_managed_subjects, current_user)
      end

      def all_managed_subjects
        Threesixty::Evaluators::GetManagedSubjectsQuery.new(object, current_user).
          query.includes(:user)
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
