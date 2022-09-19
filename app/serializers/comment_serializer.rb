# frozen_string_literal: true

class CommentSerializer < ActiveModel::Serializer
  attributes :id, :text, :created_by, :created_at, :author

  def author
    object.creator.decorate.display_name
  end
end
