# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::ExpandAnswersByRecoding do
  let(:answers) do
    {
      '17157' => {
        'answers' =>
                    [{ 'scale' => 0, 'choice' => 0, 'values' => [{ 'index' => 1, 'value' => true }] },
                     { 'scale' => 1, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => true }, { 'index' => 1, 'value' => true }] },
                     { 'scale' => 1, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => true }, { 'index' => 1, 'value' => true }] },
                     { 'scale' => 0, 'choice' => 1, 'values' => [{ 'index' => 1, 'value' => true }] },
                     { 'scale' => 0, 'choice' => 2, 'values' => [{ 'index' => 1, 'value' => true }] },
                     { 'scale' => 0, 'choice' => 3, 'values' => [{ 'index' => 1, 'value' => true }] },
                     { 'scale' => 1, 'choice' => 1, 'values' => [{ 'index' => 1, 'value' => true }] },
                     { 'scale' => 1, 'choice' => 3, 'values' => [{ 'index' => 1, 'value' => true }] }],
        'question_id' => 17_157
      }
    }
  end
  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  before do
    create(:assessment, id: 184)
    create(:question, id: 17_157, type: 'SideBySide')
    create(:question_recoding, question_id: 17_157, assessment_id: 184, props: [
             { 'scale' => 0, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 1, 'choice' => 0, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 0, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 1, 'choice' => 1, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 0, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 1, 'choice' => 2, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 0, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] },
             { 'scale' => 1, 'choice' => 3, 'values' => [{ 'index' => 0, 'value' => 1 }, { 'index' => 1, 'value' => 2 }] }
           ])
  end

  it do
    expect(described_class.call!(users_result)).to eq(
      '17157' => {
        'answers' =>
          [{ 'scale' => 0, 'choice' => 0, 'values' => [{ 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 1, 'choice' => 0, 'values' => [{ 'index' => 0, 'recode_value' => 1, 'value' => true }, { 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 1, 'choice' => 2, 'values' => [{ 'index' => 0, 'recode_value' => 1, 'value' => true }, { 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 0, 'choice' => 1, 'values' => [{ 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 0, 'choice' => 2, 'values' => [{ 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 0, 'choice' => 3, 'values' => [{ 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 1, 'choice' => 1, 'values' => [{ 'index' => 1, 'recode_value' => 2, 'value' => true }] },
           { 'scale' => 1, 'choice' => 3, 'values' => [{ 'index' => 1, 'recode_value' => 2, 'value' => true }] }],
        'question_id' => 17_157
      }
    )
  end
end
