module Assessments
  module Actions
    module Question
      extend Actions::Action

      action :filter do |data|
        questions = ::Question.where("name ILIKE ?", "%#{data['q']}%").where(view: :templates).limit(10)
        questions.map { |question| { value: question.id, label: question.name } }
      end

      action :create do |data|
        block = ::Block.find(data.delete('block_id'))
        question = block.questions.create!(data)
        QuestionSerializer.new(question).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        ::Question.update(id, data)
        ::Question.update(data['template_id'], data.slice('name', 'props', 'type')) if data['template_id']
        FactorsScoring.where(question_id: id).update_all(props: [])
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
        #parent.block.shift_down_all_questions(parent.position)
        question = ::Question.create!(data['question'])
        question.insert_at(parent.position + 1)
        QuestionSerializer.new(question).to_hash
      end

      action :insert_before do |data|
        parent = ::Question.find(data['parent_id'])
        #parent.block.shift_down_all_questions(parent.position - 1)
        question = ::Question.create!(data['question'])
        question.insert_at(parent.position)
        QuestionSerializer.new(question).to_hash
      end

      action :clone do |data|
        parent = ::Question.find(data['id'])
        question = parent.clone
        #parent.block.shift_down_all_questions(parent.position)
        question.insert_at(parent.position + 1)
        question.save
        QuestionSerializer.new(question).to_hash
      end

      action :unlink_template do |data|
        question = ::Question.includes(:template).find(data['id'])
        question.attributes = question.template.general_attributes
        question.template_id = nil
        question.save
        nil
      end

      action :create_by_template do |data|
        template = ::Question.templates.find(data['template_id'])
        block = ::Block.includes(:questions).find(data['block_id'])
        question = template.dup_for_assessment
        question.attributes = {
          block_id: data['block_id'],
          position: block.questions.size
        }
        question.save
        QuestionSerializer.new(question).to_hash(include: '**')
      end

      action :save_as_template do |data|
        question = ::Question.find(data['id'])
        template = question.dup_for_template
        template.save
        question.update_attribute(:template_id, template.id)
        QuestionSerializer.new(question).to_hash(include: '**')
      end
    end
  end
end
