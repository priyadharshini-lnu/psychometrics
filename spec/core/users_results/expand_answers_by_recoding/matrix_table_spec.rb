# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::ExpandAnswersByRecoding do
  let(:answers) do
    {
      '17156' => {
        'answers' => [
          { 'scale' => 0, 'value' => true, 'choice' => 0 },
          { 'scale' => 1, 'value' => true, 'choice' => 1 },
          { 'scale' => 2, 'value' => true, 'choice' => 2 }
        ],
        'question_id' => 17_156
      }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  before do
    create(:assessment, id: 184)
    create(:question, id: 17_156, type: 'MatrixTable')
  end

  it 'not existing recoding' do
    expect(described_class.call!(users_result)).to eq(
      '17156' => {
        'answers' => [
          { 'scale' => 0, 'value' => true, 'choice' => 0 },
          { 'scale' => 1, 'value' => true, 'choice' => 1 },
          { 'scale' => 2, 'value' => true, 'choice' => 2 }
        ],
        'question_id' => 17_156
      }
    )
  end

  it 'existing recoding' do
    create(:question_recoding, question_id: 17_156, assessment_id: 184, props: [
      { scale: 0, value: 1, choice: 0 },
      { scale: 1, value: 2, choice: 0 },
      { scale: 2, value: 3, choice: 0 },
      { scale: 0, value: 1, choice: 1 },
      { scale: 1, value: 2, choice: 1 },
      { scale: 2, value: 3, choice: 1 },
      { scale: 0, value: 1, choice: 2 },
      { scale: 1, value: 2, choice: 2 },
      { scale: 2, value: 3, choice: 2 }
    ])
    expect(described_class.call!(users_result)).to eq(
      '17156' => {
        'answers' => [
          { 'scale' => 0, 'value' => true, 'recode_value' => 1, 'choice' => 0 },
          { 'scale' => 1, 'value' => true, 'recode_value' => 2, 'choice' => 1 },
          { 'scale' => 2, 'value' => true, 'recode_value' => 3, 'choice' => 2 }
        ],
        'question_id' => 17_156
      }
    )
  end
end
