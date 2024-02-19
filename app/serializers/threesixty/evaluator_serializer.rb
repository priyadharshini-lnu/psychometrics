# frozen_string_literal: true

module Threesixty
  class EvaluatorSerializer < Panko::Serializer
    attributes :id, :status, :report_status, :is_subject, :evaluations, :evaluators, :permissions
    has_one :user, serializer: UserSerializer

    def status
      Threesixty::Participants::GetStatus.call!(
        object.self_subject,
        context[:nomination_requirement],
        counters,
        context[:subject_evaluator_counters]&.dig(object.user_id, :all) || {}
      )
    end

    def report_status
      return nil unless object.self_subject

      Threesixty::Participants::GetReportStatus.call!(
        object.self_subject,
        context[:option],
        context[:subject_evaluator_counters]&.dig(object.user_id, :completed) || {}
      )
    end

    def evaluations
      "#{counters[:completed_evaluations]} / #{counters[:total_evaluations]}"
    end

    def evaluators
      return nil unless object.self_subject

      "#{counters[:completed_evaluators]} / #{counters[:total_evaluators]}"
    end

    def is_subject
      !!object.self_subject
    end

    def counters
      context[:counters][object.user_id]
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::Threesixty::EvaluatorPolicy,
        current_user,
        object,
        [
          %w[login spoof],
          'edit',
          'remove_from_campaign',
          'allow_results_delete'
        ],
        {
          project_id: context[:project_id]
        }
      )
    end

    private

    def current_user
      context[:current_user]
    end
  end
end
