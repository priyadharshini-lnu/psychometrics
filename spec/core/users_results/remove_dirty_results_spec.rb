# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::RemoveDirtyResults do
  let(:answers) do
    {
      '17288' => {
        'answers' => [{ 'value' => '3' }],
        'question_id' => 17_288
      },
      '17289' => {
        'answers' => [{ 'value' => '3' }],
        'question_id' => 17_289,
        'dirty' => true
      }
    }
  end

  let(:users_result) { double('users_result', answers: answers, assessment_id: 184) }

  it do
    expect(described_class.call!(users_result.answers)).to eq(
      '17288' => {
        'answers' => [{ 'value' => '3' }],
        'question_id' => 17_288
      }
    )
  end
end
