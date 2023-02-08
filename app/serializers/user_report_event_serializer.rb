# frozen_string_literal: true

class UserReportEventSerializer < ActiveModel::Serializer
  attributes :id, :event_type, :details, :created_at

  has_one :initiator, serializer: ::ShortUserSerializer
end
