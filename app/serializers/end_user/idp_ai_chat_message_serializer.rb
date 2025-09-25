# frozen_string_literal: true

module EndUser
  class IdpAIChatMessageSerializer < Panko::Serializer
    attributes :id, :role, :content, :created_at
  end
end
