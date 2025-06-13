# frozen_string_literal: true

module EndUser
  class DirectReporteeSerializer < Panko::Serializer
    attributes :id, :status
    has_one :user, serializer: ::UserSerializer
  end
end
