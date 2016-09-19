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
#  view                :integer          default("assessments")
#  disabled            :boolean          default(FALSE)
#  template_id         :integer
#  skip_logic          :json
#


FactoryGirl.define do
  factory :question do
    sequence(:name) { |i| "Question #{i}" }
    type 'MultipleChoice'
    props '{
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
    block
  end
end
