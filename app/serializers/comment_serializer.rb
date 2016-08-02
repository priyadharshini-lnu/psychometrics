# == Schema Information
#
# Table name: comments
#
#  id          :integer          not null, primary key
#  text        :string
#  created_by  :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  question_id :integer
#

class CommentSerializer < ActiveModel::Serializer
  attributes :id, :text, :created_by, :created_at, :author

  def author
    object.creator.decorate.display_name
  end

end
