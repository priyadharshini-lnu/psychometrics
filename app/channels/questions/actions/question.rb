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
        template = question.clone
        template.attributes = {
          name: question.name,
          block_id: nil,
          position: nil,
          required_validation: nil,
          validation: nil,
          display_logic: nil,
          skip_logic: nil,
          view: :qcenter,
          template_id: nil
        }
        template.save
        question.template = template
        question.save
        nil
      end

    end
  end
end
