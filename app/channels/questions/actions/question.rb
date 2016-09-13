module Questions
  module Actions
    module Question
      extend Actions::Action

      action :update do |data|
        id = data.delete('id')
        ::Question.update(id, data)
        FactorsScoring.where(question_id: id).update_all(props: [])
        nil
      end

      action :rename do |data|
        ::Question.find(data['id']).update(name: data['name'])
        nil
      end

      action :unlink_template do |data|
        question = ::Question.includes(:template).find(data['id'])
        template = question.template
        question.attributes = {
          template_id: nil,
          props: question.props.merge(template.props.except(:randomization))
        }
        question.save
        nil
      end

      action :save_as_template do |data|
        question = ::Question.find(data['id'])
        template = question.dup_for_template
        template.save
        question.update_attribute(:template_id, template.id)
        nil
      end

    end
  end
end
