# frozen_string_literal: true

class UserReportEventSerializer < Panko::Serializer
  attributes :id, :event_type, :details, :created_at

  has_one :initiator, serializer: ::ShortUserSerializer
end
