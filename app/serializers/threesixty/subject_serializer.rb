module Threesixty
  class SubjectSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :evaluators, :evaluations

    has_one :user, serializer: UserSerializer
    def status
      Threesixty::Participants::GetStatus.call!(
        object.evaluator,
        object,
        @instance_options[:nomination_requirement],
        counters,
        @instance_options[:subject_evaluator_counters]&.dig(object.user_id, :all) || {}
      )
    end

    def report_status
      Threesixty::Participants::GetReportStatus.call!(
        object,
        @instance_options[:option],
        @instance_options[:subject_evaluator_counters]&.dig(object.user_id, :completed) || {}
      )
    end

    def evaluations
      return nil unless object.evaluator

      "#{counters[:completed_evaluations]} / #{counters[:total_evaluations]}"
    end

    def evaluators
      "#{counters[:completed_evaluators]} / #{counters[:total_evaluators]}"
    end

    def counters
      @instance_options[:counters][object.user_id]
    end
  end
end
