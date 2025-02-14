# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::CampaignScoreHandler do
  let!(:campaign) { create(:campaign) }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) { create(:user_assessment, subject: user, assessment: assessment, status: :completed) }
  let!(:factor) { create(:factor) }
  let!(:campaign_factor) do
    campaign_factor = create(:campaign_factor, campaign: campaign, output_type: 'numeric',
      factor_type: :formula, code: 'code', formula: 'return 4')

    create(:campaign_factor_value, campaign: campaign, campaign_factor: campaign_factor,
      numeric_value: 4.0, user: user)
  end

  let!(:field) { { 'factor_code' => 'code' } }

  it '.call' do
    campaign_scorings = CampaignUsers::CampaignUserScoresQuery.new(
      campaign_id: campaign.id,
      campaign_user_ids: [campaign_user.id],
      filter: {
        offset: 0,
        limit: 5
      }
    ).query.index_by { |s| s['id'] }
    context = {
      campaign_factors: campaign.campaign_factors.index_by(&:code),
      campaign_scorings: campaign_scorings
    }
    expect(described_class.call!(field, campaign_user: campaign_user, ctx: context)).to eq(4)
  end
end
