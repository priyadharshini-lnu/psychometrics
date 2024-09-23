# frozen_string_literal: true

require 'rails_helper'

describe Exports::Assessments::Questions::CampaignFactorFeedback do
  let(:question) { create(:question, props: { minFactors: 3, maxFactors: 3 }) }
  let(:result) do
    create(:users_result, answers: { question.id => {
      answers: [{ code: 'aaa', value: 'aaaaa' }, { code: 'bbb', value: 'bbbbbb' }],
      duration: 333
    } })
  end

  it 'returns array of rows in desired format' do
    res = described_class.result(result, question)

    expect(res).to eq(['aaa', 'aaaaa', 'bbb', 'bbbbbb', '', '', 333])
  end
end
