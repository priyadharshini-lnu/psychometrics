module Threesixty
  class SubjectSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :completed_evaluations, :received_evaluations

    has_one :user, serializer: UserSerializer
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
  end
end
