# frozen_string_literal: true

FactoryBot.define do
  factory :question do
    sequence(:name) { |i| "Question #{i}" }
    type { 'MultipleChoice' }
    props do
      {
        choices: 3,
        choicesTexts: %w[1 2 3],
        questionText: 'Click to write the question text',
        type: 'SingleAnswer',
        position: 'Vertical',
        defaultValues: [],
        randomization: {
          type: 'No'
        }
      }
    end
    block

    trait :email_question do
      type { 'TextEntry' }
      props do
        {
          choices: 0,
          choicesTexts: ['', ''],
          questionText: 'Click to write the question text',
          type: 'Email'
        }
      end
      block
    end

    trait :chat_question do
      type { 'TextEntry' }
      props do
        {
          choices: 3,
          choicesTexts: ['', '', ''],
          questionText: 'Click to write the question text',
          type: 'Chat'
        }
      end
      block
    end

    after(:create) do |question, _evaluator|
      question.block.update_column(:assessment_id, question.assessment_id)
    end
  end
end
