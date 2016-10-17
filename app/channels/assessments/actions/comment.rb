module Assessments
  module Actions
    module Comment
      extend Actions::Action

      action :create do |data, _current_user|
        question = ::Question.find(data.delete('question_id'))
        comment  = question.comments.create!(data.merge(created_by: _current_user.id))
        CommentSerializer.new(comment).to_hash
      end

      action :destroy do |data|
        ::Comment.destroy(data['id'])
        nil
      end
    end
  end
end
