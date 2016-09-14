module Blocks
  module Actions
    module Question
      extend Actions::Action

      action :update do |data|
        id = data.delete('id')
        ::Question.update(id, data)
        nil
      end

      action :rename do |data|
        ::Question.find(data['id']).update(name: data['name'])
        nil
      end

      action :create do |data, _, block|
        question = block.questions.create!(data)
        QuestionSerializer.new(question).to_hash
      end
    end
  end
end
