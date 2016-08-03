module Actions
  module Comment
    extend Actions::Action

    action :create do |data, _current_administrator|
      question = ::Question.find(data.delete('question_id'))
      comment  = question.comments.create!(data.merge(created_by: _current_administrator.id))
      CommentSerializer.new(comment).to_hash
    end

    action :destroy do |data|
      ::Comment.destroy(data['id'])
      nil
    end
  end
end
