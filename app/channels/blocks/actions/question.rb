module Blocks
  module Actions
    module Question
      extend Actions::Action

      action :create do |data|
        block = ::Block.find(data.delete('block_id'))
        question = block.questions.create!(data)
        QuestionSerializer.new(question).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        ::Question.update(id, data)
        ::Question.update(data['template_id'], data.slice('name', 'props', 'type')) if data['template_id']
        nil
      end

      action :destroy do |data|
        ::Question.find(data['id']).update(deleted_at: Time.now)
        nil
      end

      action :rename do |data|
        question = ::Question.find(data['id'])
        question.update(name: data['name'])
        question.template.update(name: data['name']) if question.template
        nil
      end

      action :move_up do |data|
        ::Question.find(data['id']).move_higher
        nil
      end

      action :move_down do |data|
        ::Question.find(data['id']).move_lower
        nil
      end

      action :create do |data, _, block|
        question = block.questions.create!(data)
        QuestionSerializer.new(question).to_hash
      end

      action :restore do |data|
        question = ::Question.find(data['id'])
        question.update(deleted_at: nil)
        QuestionSerializer.new(question).to_hash
      end

      action :permanent_destroy do |data|
        ::Question.destroy(data['id'])
        nil
      end

      action :insert_after do |data|
        parent = ::Question.find(data['parent_id'])
        question = ::Question.create!(data['question'])
        question.insert_at(parent.position + 1)
        QuestionSerializer.new(question).to_hash
      end

      action :insert_before do |data|
        parent = ::Question.find(data['parent_id'])
        question = ::Question.create!(data['question'])
        question.insert_at(parent.position)
        QuestionSerializer.new(question).to_hash
      end

      action :clone do |data|
        parent = ::Question.find(data['id'])
        question = parent.clone
        question.insert_at(parent.position + 1)
        question.save
        QuestionSerializer.new(question).to_hash
      end
    end
  end
end
