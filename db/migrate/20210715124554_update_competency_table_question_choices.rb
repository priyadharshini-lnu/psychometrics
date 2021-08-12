# frozen_string_literal: true

class UpdateCompetencyTableQuestionChoices < ActiveRecord::Migration[5.2]
  def up
    Reports::Module.where("
        type = 'Table' AND props->>'type' = 'Competencies'
        AND props->'questionId' IS NOT NULL
    ").find_each do |m|
      question_id = m.props.delete('questionId')
      question_choice_ids = m.props.delete('questionChoiceIds')
      m.props = m.props.merge({
        'questionsChoices': [{
          'questionId': question_id,
          'choiceIds': question_choice_ids
        }]
      })
      m.save(validate: false)
    end
  end
end
