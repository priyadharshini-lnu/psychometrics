# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::CampaignsController, type: :controller do
  let(:current_user) { create(:user, :assessor) }
  let(:assessors_campaign) { current_user.assessors.first.campaign }
  let!(:non_assssor_campaign) { create(:campaign) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'index' do
    it 'returns campaigns which assessor have access to' do
      get :index

      parsed_response = response.parsed_body
      campaign_details = parsed_response['list'][0]

      expect(parsed_response['total']).to eq(1)
      expect(campaign_details).to match(
        hash_including({
          'id' => assessors_campaign.id,
          'name' => assessors_campaign.name,
          'status' => assessors_campaign.status
        })
      )
      expect(DateTime.parse(campaign_details['start_date'])).to eq(assessors_campaign.start_date)
      expect(DateTime.parse(campaign_details['end_date'])).to eq(assessors_campaign.end_date)
    end
  end
end
