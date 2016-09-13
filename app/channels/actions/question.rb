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
      FactorsScoring.where(question_id: id).update_all(props: [])
      nil
    end

    action :destroy do |data|
      ::Question.find(data['id']).update(deleted_at: Time.now)
      nil
    end

    action :rename do |data|
      ::Question.find(data['id']).update(name: data['name'])
      nil
    end

    action :move_up do |data|
      ::Question.find(data['id']).update(position: data['position'])
      nil
    end

    action :move_down do |data|
      ::Question.find(data['id']).update(position: data['position'])
      nil
    end

    action :restore do |data|
      question = ::Question.find(data['id'])
      question.update(deleted_at: nil, position: data['position'])
      QuestionSerializer.new(question).to_hash
    end

    action :permanent_destroy do |data|
      ::Question.destroy(data['id'])
      nil
    end

    action :insert_after do |data|
      parent = ::Question.find(data['parent_id'])
      parent.block.shift_down_all_questions(parent.position)
      question = ::Question.create!(data['question'])
      QuestionSerializer.new(question).to_hash
    end

    action :insert_before do |data|
      parent = ::Question.find(data['parent_id'])
      parent.block.shift_down_all_questions(parent.position - 1)
      question = ::Question.create!(data['question'])
      QuestionSerializer.new(question).to_hash
    end

    action :clone do |data|
      parent = ::Question.find(data['id'])
      question = parent.clone
      parent.block.shift_down_all_questions(parent.position)
      question.position = parent.position + 1
      question.save
      QuestionSerializer.new(question).to_hash
    end

    action :save_as_template do |data|
      Rails.logger.warn "should be implemented #{data}"
    end

    action :unlink_template do |data|
      Rails.logger.warn "should be implemented #{data}"
    end
  end
end
