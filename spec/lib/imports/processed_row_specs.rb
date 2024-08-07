# frozen_string_literal: true

require 'rails_helper'

describe Imports::ProcessRows do
  it 'returns array of rows in desired format' do
    row = [['Position',
            'Name',
            'Code',
            'Description',
            'Factor Type',
            'Output Type',
            'Factor Id',
            'Assessment Id',
            'Sheet Column Name',
            'Assessment Score Type',
            'Formula',
            'Ranked',
            'Public Visibility',
            'Campaign Factor Group Name'],
           [1,
            'Overall score',
            'overall_score',
            nil,
            'formula',
            'numeric',
            nil,
            nil,
            nil,
            'norm_score',
            'return __overall_assessor_score + __overall_online_score',
            false,
            true,
            'Overall Scores'],
           [2,
            'Overall Assessor score',
            'overall_assessor_score',
            nil,
            'formula',
            'numeric',
            nil,
            nil,
            nil,
            'norm_score',
            'return __test_1 + __test2',
            false,
            true,
            'Overall Scores']]

    result = described_class.call!(row)

    expect(result.first).to eq({ 'position' => 1,
                                 'name' => 'Overall score',
                                 'code' => 'overall_score',
                                 'description' => nil,
                                 'factor_type' => 'formula',
                                 'output_type' => 'numeric',
                                 'factor_id' => nil,
                                 'assessment_id' => nil,
                                 'sheet_column_name' => nil,
                                 'assessment_score_type' => 'norm_score',
                                 'formula' => 'return __overall_assessor_score + __overall_online_score',
                                 'ranked' => false,
                                 'public_visibility' => true,
                                 'campaign_factor_group_name' => 'Overall Scores' })

    expect(result.second).to eq(
      { 'position' => 2,
        'name' => 'Overall Assessor score',
        'code' => 'overall_assessor_score',
        'description' => nil,
        'factor_type' => 'formula',
        'output_type' => 'numeric',
        'factor_id' => nil,
        'assessment_id' => nil,
        'sheet_column_name' => nil,
        'assessment_score_type' => 'norm_score',
        'formula' => 'return __test_1 + __test2',
        'ranked' => false,
        'public_visibility' => true,
        'campaign_factor_group_name' => 'Overall Scores' }
    )
  end
end
