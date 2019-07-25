# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::ExpandAnswersByRecoding do
  let(:answers) do
    {
      '17160' => {
        'answers' => [
          { 'index' => 0, 'value' => 35 }, { 'index' => 2, 'value' => 43 }, { 'index' => 1, 'value' => 50 }
        ],
        'question_id' => 17_160
      }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  before do
    create(:assessment, id: 184)
    create(:question, id: 17_160, type: 'Slider')
    # TODO (atanych): should be improved within https://gitlab.com/tte-lighthouse/psychometrics/issues/312
    create(:question_recoding, question_id: 17_160, assessment_id: 184, props: [
             { 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }, { 'index' => 2, 'value' => 3 }
           ])
  end

  it do
    expect(described_class.call!(users_result)).to eq(
      '17160' => {
        'answers' => [
          { 'index' => 0, 'value' => 35 }, { 'index' => 2, 'value' => 43 }, { 'index' => 1, 'value' => 50 }
        ],
        'question_id' => 17_160
      }
    )
  end
end
