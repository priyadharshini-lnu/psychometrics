
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
