# frozen_string_literal: true

module Dummy
  class AuthorWithAdditionalKeySerializer < Panko::Serializer
    attributes :id, :name
  end
end
