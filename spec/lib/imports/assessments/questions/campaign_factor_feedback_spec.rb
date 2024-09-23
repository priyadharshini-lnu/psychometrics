# frozen_string_literal: true

require 'rails_helper'

describe Imports::Assessments::Questions::CampaignFactorFeedback do
  let(:question) { create(:question, props: { minFactors: 3, maxFactors: 3 }) }

  it 'returns array of rows in desired format' do
    res = described_class.build_answers(['aaa', 'aaaaa', 'bbb', 'bbbbbb', '', ''], question, 333, false, false)
    expect(res).to eq({
      answers: [{ code: 'aaa', value: 'aaaaa' }, { code: 'bbb', value: 'bbbbbb' }],
      duration: 333,
      question_id: question.id
    })
  end
end
