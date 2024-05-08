# frozen_string_literal: true

module Assessments
  class CommentSerializer < Panko::Serializer
    attributes :id, :text, :created_by, :created_at, :author

    def author
      object.creator.decorate.display_name
    end
  end
end
