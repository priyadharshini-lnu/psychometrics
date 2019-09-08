# frozen_string_literal: true

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
    end
  end
end
