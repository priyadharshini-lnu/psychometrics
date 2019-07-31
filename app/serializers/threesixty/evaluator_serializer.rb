# frozen_string_literal: true

module Threesixty
  class EvaluatorSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :is_subject, :evaluations, :evaluators
    has_one :user, serializer: UserSerializer

    def status
      result = Threesixty::Participants::GetStatus.call!(
        object.self_subject,
        @instance_options[:nomination_requirement],
        counters,
        @instance_options[:subject_evaluator_counters]&.dig(object.user_id, :all) || {}
      )
      I18n.t("subjects.statuses.#{result}")
    end

    def report_status
      result = Threesixty::Participants::GetReportStatus.call!(
        object.self_subject,
        @instance_options[:option],
        @instance_options[:subject_evaluator_counters]&.dig(object.user_id, :completed) || {}
      )
      I18n.t("reports.statuses.#{result}")
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
      @instance_options[:counters][object.user_id]
    end
  end
end
