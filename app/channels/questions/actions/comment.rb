module Questions
  module Actions
    module Comment
      extend Actions::Action

      action :create do |data, current_user|
        question = ::Question.find(data.delete('question_id'))
        comment  = question.comments.create!(data.merge(created_by: current_user.id))
        CommentSerializer.new(comment).to_hash
      end

      action :destroy do |data|
        ::Comment.destroy(data['id'])
        nil
      end
    end
  end
end
