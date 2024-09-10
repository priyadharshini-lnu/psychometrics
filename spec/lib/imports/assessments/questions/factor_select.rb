# frozen_string_literal: true

require 'rails_helper'

describe Imports::Assessments::Questions::FactorSelect do
  let(:question) { create(:question) }
  let(:result) { create(:users_result, answers: { question.id => { answers: [1000, 2000], duration: 333 } }) }

  it 'returns array of rows in desired format' do
    res = described_class.build_answers(['1000;2000'], question, 333, false, false)
    expect(res).to eq({
      answers: [1000, 2000],
      duration: 333,
      question_id: question.id
    })
  end
end
