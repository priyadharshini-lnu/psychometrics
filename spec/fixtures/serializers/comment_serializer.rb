# frozen_string_literal: true

module Dummy
  class CommentSerializer < Panko::Serializer
    attributes :id, :text
  end
end
