# frozen_string_literal: true

require 'rails_helper'

describe Assessments::QuestionsImport::ProcessRows do
  it 'returns array of rows in desired format' do
    header = [
      'Block',
      'Question',
      'Question',
      'Question Property',
      'Question Property',
      'Question Property',
      'Question Property',
      'Scoring',
      'Scoring'
    ]
    subheader = %w[
      Name
      Name
      Type
      type
      choiceTexts
      choiceTexts
      choiceTexts
      Accountability
      Grit
    ]
    row1 = [
      'Block 1',
      'Question 1',
      'MultipleChoice',
      'SingleAnswer',
      'Yes',
      'No',
      'Maybe',
      1,
      2
    ]
    row2 = [
      'Block 2',
      'Question 2',
      'MultipleChoice',
      'SingleAnswer',
      'Hard',
      'Easy',
      nil,
      2,
      5
    ]

    result = described_class.call!([header, subheader, row1, row2])
    expect(result.first).to eq({
      'block' => { 'name' => 'Block 1' },
      'question' => {
        'name' => 'Question 1',
        'type' => 'MultipleChoice'
      },
      'question_property' => {
        'type' => 'SingleAnswer',
        'choiceTexts' => %w[Yes No Maybe]
      },
      'scoring' => {
        'Accountability' => 1,
        'Grit' => 2
      }
    })
    expect(result.second).to eq({
      'block' => { 'name' => 'Block 2' },
      'question' => {
        'name' => 'Question 2',
        'type' => 'MultipleChoice'
      },
      'question_property' => {
        'type' => 'SingleAnswer',
        'choiceTexts' => %w[Hard Easy]
      },
      'scoring' => {
        'Accountability' => 2,
        'Grit' => 5
      }
    })
  end
end
