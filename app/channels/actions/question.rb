# Extend Pundit helper for use in administration namespace
module Actions
  module Question
    extend Actions::Action

    action :create do |data|
      block = ::Block.find(data.delete('block_id'))
      question = block.questions.create!(data)
      QuestionSerializer.new(question).serializable_hash
    end

    action :update do |data|
      id = data.delete('id')
      ::Question.update(id, data)
      nil
    end

    action :destroy do |data|
      ::Question.find(data['id']).update(deleted_at: Time.now)
      nil
    end

    action :rename do
      ::Question.find(data['id']).update(name: data['name'])
      nil
    end

    action :move_up do |data|
      ::Question.find(data['id']).update(name: data['name'])
      nil
    end

    action :move_down do |data|
      ::Question.find(data['id']).update(position: data['position'])
      nil
    end

    action :restore do
      question = ::Question.find(data['id'])
      question.update(deleted_at: nil)
      QuestionSerializer.new(question).serializable_hash
    end

    action :permanent_destroy do |data|
      ::Question.destroy(data['id'])
      nil
    end

    action :add_comment do
      raise 'should be impl'
    end

    action :remove_comment do
      raise 'should be impl'
    end
  end
end
