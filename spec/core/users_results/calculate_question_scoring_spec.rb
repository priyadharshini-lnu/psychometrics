# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::CalculateQuestionScoring do
  let(:answers) do
    {
      '17156' => {
        'answers' => [
          { 'scale' => 2, 'value' => true, 'choice' => 0 },
          { 'scale' => 1, 'value' => true, 'choice' => 1 },
          { 'scale' => 0, 'value' => true, 'choice' => 2 }
        ],
        'question_id' => 17_156
      },
      '17157' => {
        'answers' => [
          { 'scale' => 1, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => true }, { 'index' => 1, 'value' => true }] },
          { 'scale' => 0, 'choice' => 0, 'values' => [{ 'index' => 1, 'value' => true }] }
        ],
        'question_id' => 17_157
      }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184, "completed?": true) }

  subject { described_class.call!(users_result) }

  before do
    FactorsScoring.create!(
      assessment_id: 184,
      question_id: 17_156,
      props: [
        { 'scale' => 0, 'choice' => 0, 'value' => 1 },
        { 'scale' => 1, 'choice' => 0, 'value' => 2 },
        { 'scale' => 2, 'choice' => 0, 'value' => 3 },
        { 'scale' => 0, 'choice' => 1, 'value' => 1 },
        { 'scale' => 1, 'choice' => 1, 'value' => 2 },
        { 'scale' => 2, 'choice' => 1, 'value' => 3 },
        { 'scale' => 0, 'choice' => 2, 'value' => 1 },
        { 'scale' => 1, 'choice' => 2, 'value' => 2 },
        { 'scale' => 2, 'choice' => 2, 'value' => 3 }
      ],
     factor_id: 2266
    )

    FactorsScoring.create!(
      assessment_id: 184,
      question_id: 17_157,
      factor_id: 2266,
      props: [
        { 'scale' => 0, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 1, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 0, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 1, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 0, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 1, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 0, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
        { 'scale' => 1, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] }
      ]
    )

    Question.create!(assessment_id: 184, name: 'Q1', id: 17_156, type: 'MatrixTable')
    Question.create!(assessment_id: 184, name: 'Q2', id: 17_157, type: 'SideBySide')
  end

  it '.call' do
    expect(subject).to eq([{ "question_id": 17_157, "value": 1.6666666666666667, "options": [] }, { "question_id": 17_156, "value": 2.0, "options": [] }])
  end
end
