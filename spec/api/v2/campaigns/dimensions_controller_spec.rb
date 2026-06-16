# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::Campaigns::DimensionsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessor) { create(:user, :assessor) }
  let!(:campaign) { create(:campaign) }
  let!(:dimension) { create(:dimension, :with_factor) }
  let!(:dimensions_id) { dimension.id }
  let!(:assessment) { create(:assessment, dimension: dimension) }
  let(:user) { create(:user) }
  let(:campaign_id) { campaign.id }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:campaign_assessor_assessment) do
    create(:campaign_assessor_assessment, campaign: campaign, assessment: assessment)
  end
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/dimensions/assessor_dimensions' do
    it 'returns dimensions list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/dimensions/assessor_dimensions"

      expect(response).to have_http_status(200)
      d = JSON.parse(response.body)['data'].first
      expect(d).to have_attribute(:name)
      expect(d['attributes']['name']).to eq(dimension.name)
    end
  end

  describe 'GET /api/v2/administration/campaigns/{campaign_id}/dimensions/{dimensions_id}/factors' do
    it 'returns factors for a dimension' do
      get "/api/v2/administration/campaigns/#{campaign_id}/dimensions/#{dimensions_id}/factors"

      expect(response).to have_http_status(200)
      d = JSON.parse(response.body)['data'].first
      expect(d).to have_attribute(:name)
      expect(d['attributes']['name']).to eq(dimension.factors.first.name)
    end
  end
end
