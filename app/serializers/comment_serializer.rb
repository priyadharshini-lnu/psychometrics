class CommentSerializer < ActiveModel::Serializer
  attributes :id, :text, :created_by, :created_at

end
