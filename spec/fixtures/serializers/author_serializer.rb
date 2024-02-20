# frozen_string_literal: true

module Dummy
  class AuthorSerializer < Panko::Serializer
    attributes :id, :name
  end
end
