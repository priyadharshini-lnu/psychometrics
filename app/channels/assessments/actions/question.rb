module Assessments
  module Actions
    module Question
      extend Actions::Action

      action :filter do |data|
        questions = ::Question.where('name ILIKE ?', "%#{data['q']}%").where(view: :templates).limit(10)
        questions.map { |question| { value: question.id, label: question.name } }
      end

      action :create do |data, _current_user, assessment|
        block = ::Block.find(data.delete('block_id'))
        data['assessment_id'] = assessment.id
        question = block.questions.create!(data)
        QuestionSerializer.new(question).to_hash
      end

      action :update do |data|
        id = data.delete('id')
        question = ::Question.find(id)
        if question.props != data['props'] || question.type != data['type']
          FactorsScoring.where(question_id: id).update_all(props: [])
        end
        question.update(data)
        nil
      end

      action :destroy do |data|
        question = ::Question.find(data['id'])
        question.update(deleted_at: Time.now)
        question.remove_from_list
        nil
      end

      action :rename do |data|
        question = ::Question.find(data['id'])
        question.update(name: data['name'])
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
        question.move_to_bottom
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

      action :unlink_template do |data|
        question = ::Question.includes(:template).find(data['id'])
        question.attributes = question.template.general_attributes
        question.template_id = nil
        question.save
        nil
      end

      action :create_by_template do |data|
        template = ::Question.templates.find(data['template_id'])
        Assessments::Actions::Question::CreateByTemplate::QuestionSerializer.new(template).to_hash(include: '**')
      end

      action :save_as_template do |data|
        question = ::Question.find(data['id'])
        question.dup_for_template!
        QuestionSerializer.new(question).to_hash(include: '**')
      end
    end
  end
end
