# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::ResultSerializer do
  let(:raw_data) do
    [{ key: 'first_name', name: 'First Name', config_data: { 'key' => 'first_name', 'type' => 'user_data', 'label' => 'First Name' }, value: 'Shuja' },
     { key: 'last_name', name: 'Last Name', config_data: { 'key' => 'last_name', 'type' => 'user_data', 'label' => 'Last Name' }, value: 'GPTS' },
     { key: 549, name: 'Accountability', config_data: { 'type' => 'normed_factor', 'factorId' => 549, 'assessmentId' => 17 }, value: 6 },
     { key: 554, name: 'Efficacy', config_data: { 'type' => 'normed_factor', 'factorId' => 554, 'assessmentId' => 17 }, value: 5 },
     { key: 2, name: 'Occupation 2', config_data: { 'type' => 'ranked_occupations', 'label' => 'OccupationRank 1', 'order' => 'desc', 'position' => 1, 'assessmentId' => 17 }, value: 3 },
     { key: 3, name: 'Occupation 3', config_data: { 'type' => 'ranked_occupations', 'label' => 'OccupationRank 2', 'order' => 'desc', 'position' => 2, 'assessmentId' => 18 }, value: 5 }]
  end

  before do
    create(:assessment, id: 17, name: 'ass 17')
    create(:assessment, id: 18, name: 'ass 18')
  end

  subject { described_class.new(raw_data).to_h }
  it do
    is_expected.to eq(
      user_data: { 'first_name' => 'Shuja', 'last_name' => 'GPTS' },
      assessments: [
        {
          id: 17,
          name: 'ass 17',
          results: {
            normed_factors: [
              { id: 549, name: 'Accountability', value: 6 },
              { id: 554, name: 'Efficacy', value: 5 }
            ],
            ranked_occupations: [
              {
                id: 2,
                rank: 1,
                name: 'Occupation 2',
                stars: 0,
                value: 3
              }
            ]
          }
        },
        {
          id: 18,
          name: 'ass 18',
          results: {
            normed_factors: [],
            ranked_occupations: [
              {
                id: 3,
                rank: 2,
                name: 'Occupation 3',
                stars: 0,
                value: 5
              }
            ]
          }
        }
      ]
    )
  end
end
