# frozen_string_literal: true

module Dummy
  class AuthorWithoutValidatesKeysSerializer < Panko::Serializer
    attributes :id, :name
  end
end
