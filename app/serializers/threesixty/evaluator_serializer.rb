# frozen_string_literal: true

module Threesixty
  class EvaluatorSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :is_subject, :evaluations, :evaluators
    has_one :user, serializer: UserSerializer

    def status
      Threesixty::Participants::GetStatus.call!(object, object.subject, @instance_options[:option], @instance_options[:nomination_requirement])
    end

    def report_status
      Threesixty::Participants::GetReportStatus.call!(object.subject, @instance_options[:option])
    end

    def evaluations
      "#{object.completed_evaluations_count} / #{object.evaluations_count}"
    end

    def evaluators
      return nil unless object.subject

      "#{object.subject.completed_evaluators_count} / #{object.subject.evaluators_count}"
    end

    def is_subject
      !!object.subject
    end
  end
end
