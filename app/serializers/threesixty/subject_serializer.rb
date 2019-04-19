module Threesixty
  class SubjectSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :evaluators, :evaluations

    has_one :user, serializer: UserSerializer
    def status
      :incomplete
    end

    def report_status
      Threesixty::Participants::GetReportStatus.call!(object, @instance_options[:option])
    end

    def evaluations
      "#{object.evaluator&.completed_evaluations_count || 0} / #{object.evaluator&.evaluations_count || 0}"
    end

    def evaluators
      "#{object.completed_evaluators_count} / #{object.evaluators_count}"
    end
  end
end
