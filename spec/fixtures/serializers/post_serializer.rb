# frozen_string_literal: true

module Dummy
  class PostSerializer < Panko::Serializer
    attributes :id, :title

    has_one :author, serializer: Dummy::AuthorSerializer
    has_many :comments, serializer: Dummy::CommentSerializer
  end
end
