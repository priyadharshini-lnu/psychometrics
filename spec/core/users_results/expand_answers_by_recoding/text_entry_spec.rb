# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::ExpandAnswersByRecoding do
  let(:answers) do
    {
      '17288' => {
        'answers' => [{ 'value' => '3' }],
        'question_id' => 17_288
      }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  before do
    create(:assessment, id: 184)
    create(:question, id: 17_288, type: 'TextEntry')
    create(:question_recoding, question_id: 17_288, assessment_id: 184, props: [
             { "index": '3', "value": 3 }, { "index": '4', "value": 4 }
           ])
  end

  it do
    expect(described_class.call!(users_result)).to eq(
      '17288' => {
        'answers' => [{ 'value' => '3', 'recode_value' => 3 }],
        'not_applicable' => nil,
        'question_id' => 17_288
      }
    )
  end
end
