# frozen_string_literal: true

module Threesixty
  class ParticipantSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :completed_evaluations, :received_evaluations, :is_subject

    has_one :evaluator, serializer: UserSerializer
    has_one :subject, serializer: UserSerializer
    def status
      :incomplete
    end

    def report_status
      :incomplete
    end

    def completed_evaluations
      '1 / 2'
    end

    def received_evaluations
      '1 / 5'
    end

    def is_subject
      !!@instance_options[:subject_map][object.evaluator_id]
    end
  end
end
