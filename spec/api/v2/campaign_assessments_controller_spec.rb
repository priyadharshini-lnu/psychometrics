# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignAssessmentsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:campaign_id) { campaign.id }
  let!(:workshop) { create(:workshop, :with_managers, :with_assessors, campaign_id: campaign_id) }
  let!(:workshop_id) { workshop.id }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign) }

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/campaigns/:campaign_id/workshops/:workshop_id/campaign_assessments' do
    it 'fetches campaign assessments list' do
      get "/api/v2/administration/campaigns/#{campaign_id}/workshops/#{workshop_id}/campaign_assessments"

      expect(response).to have_http_status(:ok)
      workshop_response = JSON.parse(response.body)['data'].first
      expect(workshop_response).to have_attribute(:campaign_id).with_value(campaign.id)
      expect(workshop_response).to have_relationship(:assessment)
    end
  end
end
