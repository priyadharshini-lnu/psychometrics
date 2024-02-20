# frozen_string_literal: true

module Dummy
  class AuthorWithoutSchemaSerializer < Panko::Serializer
    attributes :id, :name
  end
end
