module Threesixty
  class NominationSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :completed_evaluations, :received_evaluations

    has_one :subject, serializer: UserSerializer
  end
end
