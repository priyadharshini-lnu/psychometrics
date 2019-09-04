# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::ExpandAnswersByRecoding do
  let(:answers) do
    {
      '17159' => {
        'answers' => [
          { 'scale' => 1, 'value' => 0, 'choice' => 2 },
          { 'scale' => 0, 'value' => 0, 'choice' => 0 },
          { 'scale' => 0, 'value' => 1, 'choice' => 1 }
        ],
        'question_id' => 17_159
      }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  before do
    create(:assessment, id: 184)
    create(:question, id: 17_159, type: 'PickGroupRank')
    # TODO (atanych): should be improved within https://gitlab.com/tte-lighthouse/psychometrics/issues/311
    create(:question_recoding, question_id: 17_159, assessment_id: 184, props: [
             { 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2, 'value' => 3 }
           ])
  end

  it do
    expect(described_class.call!(users_result)).to eq(
      '17159' => {
        'answers' => [
          { 'scale' => 1, 'value' => 0, 'choice' => 2 },
          { 'scale' => 0, 'value' => 0, 'choice' => 0 },
          { 'scale' => 0, 'value' => 1, 'choice' => 1 }
        ],
        'not_applicable' => nil,
        'question_id' => 17_159
      }
    )
  end
end
