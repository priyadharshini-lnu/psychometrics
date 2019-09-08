# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::ExpandAnswersByRecoding do
  let(:answers) do
    {
      '17158' => { 'answers' => [{ 'index' => 0, 'value' => true }], 'question_id' => 17_158 }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  before do
    create(:assessment, id: 184)
    create(:question, id: 17_158, type: 'MultipleChoice')
    create(:question_recoding, question_id: 17_158, assessment_id: 184, props: [
             { index: 0, value: 1 }, { index: 1, value: 2 }, { index: 2, value: 3 }
           ])
  end

  it do
    expect(described_class.call!(users_result)).to eq(
      '17158' => { 'answers' => [{ 'index' => 0, 'value' => true, 'recode_value' => 1 }], 'not_applicable' => nil, 'question_id' => 17_158 }
    )
  end
end
