# frozen_string_literal: true

require 'rails_helper'

describe Reports::GetDataConfigurationResources do
  let(:factor1) { create(:factor) }
  let(:factor2) { create(:factor) }
  let!(:factor1_alias) { create(:factors_alias, factor: factor1, report: report, name: 'alias_factor') }
  let(:question) { create(:question) }
  let(:report) do
    create(:report, data_configuration: {
      'sections' => [
        {
          'data' => [
            { 'type' => 'normed_factor', 'label' => 'Reasonify', 'factorId' => factor1.id },
            { 'type' => 'normed_factor', 'label' => 'Reasonify', 'factorId' => factor2.id }
          ]
        },
        {
          'data' => [
            { 'type' => 'survey_response', 'label' => 'Country of Study', 'questionId' => question.id }
          ]
        }
      ]
    })
  end

  it 'returns factor alias name if present or return factor name' do
    result = described_class.call!(report)
    expected = {}
    expected[factor1.id] = factor1_alias.name
    expected[factor2.id] = factor2.name
    expect(result[:factor_names]).to eq(expected)
  end

  it 'returns question indexed by id' do
    result = described_class.call!(report)
    expected = {}
    expected[question.id] = question
    expect(result[:questions]).to eq(expected)
  end
end
