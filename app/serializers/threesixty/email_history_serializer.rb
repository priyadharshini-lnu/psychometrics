# frozen_string_literal: true

module Threesixty
  class EmailHistorySerializer < ActiveModel::Serializer
    attributes :id, :status, :created_at
  end
end
