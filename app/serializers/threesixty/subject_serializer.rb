module Threesixty
  class SubjectSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :evaluators, :evaluations

    has_one :user, serializer: UserSerializer
    def status
      Threesixty::Participants::GetStatus.call!(object.evaluator, object, @instance_options[:option], @instance_options[:nomination_requirement])
    end

    def report_status
      Threesixty::Participants::GetReportStatus.call!(object, @instance_options[:option])
    end

    def evaluations
      return nil unless object.evaluator

      "#{object.evaluator.completed_evaluations_count} / #{object.evaluator.evaluations_count}"
    end

    def evaluators
      "#{object.completed_evaluators_count} / #{object.evaluators_count}"
    end
  end
end
