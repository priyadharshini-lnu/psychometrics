# frozen_string_literal: true

# == Schema Information
#
# Table name: questions
#
#  id                  :integer          not null, primary key
#  name                :string
#  position            :integer
#  type                :string
#  props               :json
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  block_id            :integer
#  deleted_at          :datetime
#  required_validation :json
#  validation          :json
#  display_logic       :json
#  skip_logic          :json
#  view                :integer          default("assessments")
#  disabled            :boolean          default(FALSE)
#  template_id         :integer
#  assessment_id       :integer
#  owner_id            :integer
#

FactoryBot.define do
  factory :question do
    sequence(:name) { |i| "Question #{i}" }
    type { 'MultipleChoice' }
    props do
      '{
        "choices": 3,
        "choicesTexts":["","",""],
        "questionText": "Click to write the question text",
        "type": "SingleAnswer",
        "position": "Vertical",
        "defaultValues": [],
        "randomization": {
          "type": "No"
        }
      }'
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
