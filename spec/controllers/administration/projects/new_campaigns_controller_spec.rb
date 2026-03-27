# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Projects::NewCampaignsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let!(:campaign) { create :campaign }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'DELETE' do
    it 'removes campaign_report' do
      expect do
        delete :destroy, params: {
          id: campaign.id,
          project_id: campaign.project_id
        }
      end.to change(Campaign, :count).by(-1)
      expect(response.body).to eq(campaign.id.to_s)
    end
  end

  describe 'fetch_descriptions' do
    it 'passes description with all locales passed in params' do
      campaign_option = campaign.campaign_options
      Mobility.with_locale('en') do
        campaign_option.update(description: 'En Desc')
      end
      Mobility.with_locale('ar') do
        campaign_option.update(description: 'Ar Desc')
      end
      Mobility.with_locale('fr') do
        campaign_option.update(description: 'Fr Desc')
      end
      get :fetch_descriptions,
          params: { id: campaign.id, project_id: campaign.project_id, locales: %w[en ar] }

      parsed_body = response.parsed_body

      expect(parsed_body).to eq(
        {
          'list' => [
            { 'description' => 'En Desc', 'locale' => 'en' },
            { 'description' => 'Ar Desc', 'locale' => 'ar' }
          ],
          'available_locales' => %w[en ar fr]
        }
      )
    end
  end

  describe 'update_campaign_options' do
    it 'updates minimum upload and download speeds and returns serialized options' do
      campaign_option = campaign.campaign_options

      patch :update_campaign_options,
            params: {
              id: campaign.id,
              project_id: campaign.project_id,
              resource: {
                minimum_upload_speed: 123,
                minimum_download_speed: 456
              }
            }

      expect(response).to have_http_status(:ok)

      campaign_option.reload

      expect(campaign_option.minimum_upload_speed).to eq(123)
      expect(campaign_option.minimum_download_speed).to eq(456)

      parsed = response.parsed_body
      expect(parsed['minimum_upload_speed']).to eq(123)
      expect(parsed['minimum_download_speed']).to eq(456)
    end
  end
end
