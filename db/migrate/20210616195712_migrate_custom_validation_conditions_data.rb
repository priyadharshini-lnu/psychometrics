# frozen_string_literal: true

class MigrateCustomValidationConditionsData < ActiveRecord::Migration[5.2]
  def change
    questions = Question.where("validation->>'type' = 'Custom'")
    questions.each do |question|
      question.validation['customValidations'] = [{
        uuid: question.id,
        message: question.validation['message'],
        conditions: question.validation['args']['conditions']
      }]
    end
  end
end
