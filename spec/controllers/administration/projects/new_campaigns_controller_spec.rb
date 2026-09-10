# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Administration::Projects::NewCampaignsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let!(:campaign) { create :campaign }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  def build_csv_upload(content = "Campaign ID,English / en\n1,Test\n")
    file = Tempfile.new(['campaign-translations', '.csv'])
    file.write(content)
    file.rewind

    Rack::Test::UploadedFile.new(file.path, 'text/csv', original_filename: 'campaign-translations.csv')
  end

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

  describe 'fetch_name_translations' do
    it 'returns name translations for requested locales and available locales list' do
      Mobility.with_locale('en') do
        campaign.update!(name: 'Campaign EN')
      end
      Mobility.with_locale('ar') do
        campaign.update!(name: 'Campaign AR')
      end
      Mobility.with_locale('fr') do
        campaign.update!(name: 'Campaign FR')
      end

      get :fetch_name_translations,
          params: { id: campaign.id, project_id: campaign.project_id, locales: %w[en ar] }

      parsed_body = response.parsed_body

      expect(parsed_body).to eq(
        {
          'list' => [
            { 'name' => 'Campaign EN', 'locale' => 'en' },
            { 'name' => 'Campaign AR', 'locale' => 'ar' }
          ],
          'available_locales' => %w[en ar fr]
        }
      )
    end
  end

  describe 'PUT update' do
    it 'updates campaign name translation for selected locale only' do
      Mobility.with_locale('en') do
        campaign.update!(name: 'Campaign EN')
      end

      put :update,
          params: {
            id: campaign.id,
            project_id: campaign.project_id,
            resource: {
              name: 'Campaign AR Updated',
              name_locale: 'ar',
              status: 'active',
              type: 'common'
            }
          }

      expect(response).to have_http_status(:ok)

      campaign.reload

      Mobility.with_locale('ar') do
        expect(campaign.name).to eq('Campaign AR Updated')
      end
    end
  end

  describe 'update_campaign_options' do
    it 'updates system check options and returns serialized options' do
      campaign_option = campaign.campaign_options

      patch :update_campaign_options,
            params: {
              id: campaign.id,
              project_id: campaign.project_id,
              resource: {
                system_check_enabled: true,
                skip_assessment_level_checks: false,
                minimum_upload_speed: 123,
                minimum_download_speed: 456
              }
            }

      expect(response).to have_http_status(:ok)

      campaign_option.reload

      expect(campaign_option.system_check_enabled).to be true
      expect(campaign_option.skip_assessment_level_checks).to be false
      expect(campaign_option.minimum_upload_speed).to eq(123)
      expect(campaign_option.minimum_download_speed).to eq(456)

      parsed = response.parsed_body
      expect(parsed['system_check_enabled']).to be true
      expect(parsed['skip_assessment_level_checks']).to be false
      expect(parsed['minimum_upload_speed']).to eq(123)
      expect(parsed['minimum_download_speed']).to eq(456)
    end

    it 'lets a Super Admin toggle disable_webhooks' do
      campaign_option = campaign.campaign_options

      patch :update_campaign_options,
            params: {
              id: campaign.id,
              project_id: campaign.project_id,
              resource: { disable_webhooks: true }
            }

      expect(response).to have_http_status(:ok)
      expect(campaign_option.reload.disable_webhooks).to be true
      expect(response.parsed_body['disable_webhooks']).to be true
    end

    it 'ignores disable_webhooks submitted by a non Super Admin' do
      sign_out(current_user)
      project_admin = create(:project_admin, project: campaign.project)
      login_user(project_admin)

      patch :update_campaign_options,
            params: {
              id: campaign.id,
              project_id: campaign.project_id,
              resource: { disable_webhooks: true }
            }

      expect(response).to have_http_status(:ok)
      expect(campaign.campaign_options.reload.disable_webhooks).to be false
    end
  end

  describe 'translation import/export' do
    it 'starts export campaign translations job' do
      expect(AdminJob).to receive(:call).with(:export_campaign_translations, { project_id: campaign.project_id },
                                              current_user)

      post :export_campaign_translations, params: { project_id: campaign.project_id }

      expect(response).to have_http_status(:ok)
    end

    it 'starts import campaign translations job when form is valid' do
      file = build_csv_upload
      form = instance_double(Api::V2::Administration::CampaignTranslationImportForm, valid?: true, row_count: 2,
processed_file: file)
      allow(Api::V2::Administration::CampaignTranslationImportForm).to receive(:new).and_return(form)
      allow(AdminJob).to receive(:call)

      post :import_campaign_translations, params: { project_id: campaign.project_id, file: file }

      expect(AdminJob).to have_received(:call).with(:import_campaign_translations, { project_id: campaign.project_id },
                                                    current_user, file)
      expect(response).to have_http_status(:ok)
    end

    it 'returns unprocessable entity when import form is invalid' do
      file = build_csv_upload
      errors = instance_double(ActiveModel::Errors, full_messages: ['Bad CSV'])
      form = instance_double(Api::V2::Administration::CampaignTranslationImportForm, valid?: false, errors: errors)
      allow(Api::V2::Administration::CampaignTranslationImportForm).to receive(:new).and_return(form)

      post :import_campaign_translations, params: { project_id: campaign.project_id, file: file }

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to eq('errors' => ['Bad CSV'])
    end
  end
end
