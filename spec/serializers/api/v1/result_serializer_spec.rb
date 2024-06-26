# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::ResultSerializer do
  let(:assessment1) { create(:assessment, name: 'ass 17') }
  let(:assessment2) { create(:assessment, name: 'ass 18') }

  let(:raw_data) do
    [{ key: 'first_name', name: 'First Name',
       config_data: { 'key' => 'first_name', 'type' => 'user_data', 'label' => 'First Name' }, value: 'Shuja' },
     { key: 'last_name', name: 'Last Name',
       config_data: { 'key' => 'last_name', 'type' => 'user_data', 'label' => 'Last Name' }, value: 'GPTS' },
     { key: 549, name: 'Accountability',
       config_data: { 'type' => 'normed_factor', 'factorId' => 549, 'assessmentId' => assessment1.id }, value: 6 },
     { key: 554, name: 'Efficacy',
       config_data: { 'type' => 'normed_factor', 'factorId' => 554, 'assessmentId' => assessment1.id }, value: 5 },
     { key: 2, name: 'Occupation 2',
       config_data: {
         'type' => 'ranked_occupations',
         'label' => 'OccupationRank 1', 'order' => 'desc', 'position' => 1, 'assessmentId' => assessment1.id
       }, value: 3 },
     { key: 3, name: 'Occupation 3',
       config_data: {
         'type' => 'ranked_occupations',
         'label' => 'OccupationRank 2', 'order' => 'desc', 'position' => 2, 'assessmentId' => assessment2.id
       }, value: 5 },
     { key: 'id_number', name: 'ID Number',
       config_data: {
         'id' => 'id_number',
         'type' => 'datasheet',
         'key' => 'id_number',
         'label' => 'ID Number',
         'category' => 'user_data'
       }, value: '123456' },
     { key: 'rating', name: 'Rating',
       config_data: {
         'id' => 'rating',
         'type' => 'datasheet',
         'key' => 'rating',
         'label' => 'Rating',
         'category' => 'computed_scores'
       }, value: 4.5 }]
  end

  let(:user_report) { create(:user_report) }

  subject { described_class.new(context: { user_report: user_report }).serialize(raw_data).deep_symbolize_keys }
  it do
    expect(subject[:campaign_id]).to eq(user_report.campaign_id)
    expect(subject[:user_data]).to eq({ first_name: 'Shuja', last_name: 'GPTS', id_number: '123456' })
    expect(subject[:computed_scores]).to eq([{ id: 'rating', name: 'Rating', value: 4.5 }])
    expect(subject[:assessments]).to match_array(
      [
        {
          id: assessment1.id,
          name: 'ass 17',
          results: {
            normed_factors: [
              { id: 549, name: 'Accountability', value: 6 },
              { id: 554, name: 'Efficacy', value: 5 }
            ],
            raw_factors: [],
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
          id: assessment2.id,
          name: 'ass 18',
          results: {
            normed_factors: [],
            raw_factors: [],
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
