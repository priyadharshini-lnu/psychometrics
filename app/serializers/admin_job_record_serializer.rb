# frozen_string_literal: true

class AdminJobRecordSerializer < ActiveModel::Serializer
  attributes :id, :operation, :progress, :data, :status, :error_messages, :content, :read, :created_at
end
