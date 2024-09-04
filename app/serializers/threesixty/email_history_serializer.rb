# frozen_string_literal: true

module Threesixty
  class EmailHistorySerializer < Panko::Serializer
    attributes :id, :status, :created_at
  end
end
