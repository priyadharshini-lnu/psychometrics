# frozen_string_literal: true

require 'faker'

campaign_id = ENV.fetch('CAMPAIGN_ID', nil)

ApplicationRecord.transaction do
  campaign = Campaign.find(campaign_id)
  group1 = campaign.campaign_factor_groups.create!(name: 'Group 1', position: 1)
  group2 = campaign.campaign_factor_groups.create!(name: 'Group 2', position: 2)
  group1_factor1 = campaign.campaign_factors.create!(
    campaign_factor_group: group1,
    name: 'G1 Factor 1',
    code: 'g1_factor_1',
    factor_type: 'datasheet',
    output_type: 'numeric',
    sheet_column_name: 'G1_Factor_1',
    position: 1
  )
  assessment = Assessment.psychometric.joins(dimension: :factors).
               where.not(factors: { id: nil }).distinct.select(:id, :dimension_id).last
  group1_factor2 = campaign.campaign_factors.create!(
    campaign_factor_group: group1,
    name: 'G1 Factor 2',
    code: 'g1_factor_2',
    factor_type: 'assessment',
    assessment: assessment,
    factor: assessment.dimension.factors.first,
    output_type: 'numeric',
    position: 2
  )

  group2_factor1 = campaign.campaign_factors.create!(
    campaign_factor_group: group2,
    name: 'G2 Factor 1',
    code: 'g2_factor_1',
    factor_type: 'datasheet',
    output_type: 'string',
    sheet_column_name: 'G2_Factor_1',
    position: 1
  )
  subject_user = Users::Regular.create!(
    first_name: Faker::Name.first_name,
    last_name: Faker::Name.last_name,
    email: Faker::Internet.email,
    password: 'Random@password1'
  )
  CampaignUser.create!(campaign: campaign, user: subject_user)

  campaign.campaign_factor_values.create!(
    user: subject_user,
    campaign_factor: group1_factor1,
    numeric_value: 1
  )
  campaign.campaign_factor_values.create!(
    user: subject_user,
    campaign_factor: group1_factor2,
    numeric_value: 2
  )
  campaign.campaign_factor_values.create!(
    user: subject_user,
    campaign_factor: group2_factor1,
    string_value: 'Group 2 Factor 1 Value'
  )
end
