# frozen_string_literal: true

require 'rails_helper'

describe Exports::Assessments::Questions::FactorSelect do
  let(:question) { create(:question) }
  let(:result) { create(:users_result, answers: { question.id => { answers: [1000, 2000], duration: 333 } }) }

  it 'returns array of rows in desired format' do
    res = described_class.result(result, question)
    expect(res).to eq(['1000;2000', 333])
  end
end
