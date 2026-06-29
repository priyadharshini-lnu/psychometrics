# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ApplicationIpWhitelistEntriesController, type: :controller do
  let(:tenant) { create(:tenancy) }
  let(:superadmin) { create(:superadmin) }
  let(:application) { create(:application_user, tenant: tenant) }
  let(:setting) { application.application_setting }

  before do
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  describe 'GET #index' do
    let!(:entry) { create(:application_ip_whitelist_entry, application_setting: setting) }

    it 'returns all entries for the application' do
      get :index, params: { application_id: application.id }

      expect(response).to have_http_status(:ok)
      ids = parsed_response['data'].map { |d| d['id'].to_i }
      expect(ids).to include(entry.id)
    end

    it 'does not return entries for other applications' do
      other_app = create(:application_user, tenant: tenant)
      other_entry = create(:application_ip_whitelist_entry, application_setting: other_app.application_setting)

      get :index, params: { application_id: application.id }

      ids = parsed_response['data'].map { |d| d['id'].to_i }
      expect(ids).not_to include(other_entry.id)
    end
  end

  describe 'POST #create' do
    let(:create_params) do
      {
        application_id: application.id,
        data: {
          type: 'application_ip_whitelist_entries',
          attributes: { ip_or_cidr: '10.0.0.1' }
        }
      }
    end

    it 'creates a new entry' do
      expect do
        post :create, params: create_params
      end.to change(ApplicationIpWhitelistEntry, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it 'associates the entry with the application setting' do
      post :create, params: create_params
      expect(ApplicationIpWhitelistEntry.last.application_setting_id).to eq(setting.id)
    end

    it 'returns unprocessable content for an invalid IP' do
      create_params[:data][:attributes][:ip_or_cidr] = 'invalid'
      post :create, params: create_params
      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'returns unprocessable content when ip_or_cidr is missing' do
      create_params[:data][:attributes].delete(:ip_or_cidr)
      post :create, params: create_params
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'PATCH #update' do
    let!(:entry) { create(:application_ip_whitelist_entry, application_setting: setting, enabled: true) }

    let(:update_params) do
      {
        application_id: application.id,
        id: entry.id,
        data: {
          type: 'application_ip_whitelist_entries',
          id: entry.id.to_s,
          attributes: { enabled: false }
        }
      }
    end

    it 'updates the entry' do
      patch :update, params: update_params
      expect(entry.reload.enabled).to be false
    end

    it 'returns success' do
      patch :update, params: update_params
      expect(response).to have_http_status(:ok)
    end

    context 'ip_whitelisting_enabled in response reflects committed DB state' do
      context 'when disabling a non-last enabled entry (another enabled entry remains)' do
        let!(:other_entry) do
          create(:application_ip_whitelist_entry, application_setting: setting, enabled: true)
        end

        before { setting.update!(ip_whitelisting_enabled: true) }

        it 'returns ipWhitelistingEnabled true because whitelisting is still active' do
          patch :update, params: update_params

          expect(response).to have_http_status(:ok)
          attributes = parsed_response.dig('data', 'attributes')
          expect(attributes['ip_whitelisting_enabled']).to be true
        end
      end

      context 'when disabling the last enabled entry' do
        before { setting.update!(ip_whitelisting_enabled: true) }

        it 'returns ipWhitelistingEnabled false reflecting the after_commit auto-disable' do
          patch :update, params: update_params

          expect(response).to have_http_status(:ok)
          attributes = parsed_response.dig('data', 'attributes')
          expect(attributes['ip_whitelisting_enabled']).to be false
        end

        it 'persists ip_whitelisting_enabled false in the DB' do
          patch :update, params: update_params
          expect(setting.reload.ip_whitelisting_enabled).to be false
        end
      end

      context 'when re-enabling an entry while ApplicationSetting ip_whitelisting_enabled is false' do
        before do
          entry.update!(enabled: false)
          setting.update!(ip_whitelisting_enabled: false)
        end

        let(:re_enable_params) do
          {
            application_id: application.id,
            id: entry.id,
            data: {
              type: 'application_ip_whitelist_entries',
              id: entry.id.to_s,
              attributes: { enabled: true }
            }
          }
        end

        it 'does not auto-enable ApplicationSetting ip_whitelisting_enabled' do
          patch :update, params: re_enable_params

          expect(setting.reload.ip_whitelisting_enabled).to be false
        end

        it 'returns ipWhitelistingEnabled false because ApplicationSetting was not auto-enabled' do
          patch :update, params: re_enable_params

          attributes = parsed_response.dig('data', 'attributes')
          expect(attributes['ip_whitelisting_enabled']).to be false
        end
      end
    end
  end

  describe 'POST #bulk_create' do
    let(:bulk_create_params) do
      {
        application_id: application.id,
        data: {
          attributes: {
            entries: [
              { ip_or_cidr: '10.0.0.1', description: 'Office' },
              { ip_or_cidr: '192.168.1.0/24', description: 'VPN range' }
            ]
          }
        }
      }
    end

    it 'creates all entries and returns ok' do
      expect do
        post :bulk_create, params: bulk_create_params
      end.to change(ApplicationIpWhitelistEntry, :count).by(2)

      expect(response).to have_http_status(:ok)
    end

    it 'associates all entries with the application setting' do
      post :bulk_create, params: bulk_create_params

      created_ids = ApplicationIpWhitelistEntry.last(2).map(&:application_setting_id)
      expect(created_ids).to all(eq(setting.id))
    end

    it 'returns the created entries in the response' do
      post :bulk_create, params: bulk_create_params

      returned_ids = parsed_response['data'].map { |d| d['id'].to_i }
      expect(returned_ids).to match_array(ApplicationIpWhitelistEntry.last(2).map(&:id))
    end

    it 'persists optional description when provided' do
      post :bulk_create, params: bulk_create_params

      descriptions = ApplicationIpWhitelistEntry.last(2).map(&:description)
      expect(descriptions).to match_array(['Office', 'VPN range'])
    end

    it 'accepts entries without a description' do
      bulk_create_params[:data][:attributes][:entries] = [{ ip_or_cidr: '10.0.0.2' }]

      expect do
        post :bulk_create, params: bulk_create_params
      end.to change(ApplicationIpWhitelistEntry, :count).by(1)

      expect(response).to have_http_status(:ok)
    end

    context 'when an entry has an invalid IP' do
      before do
        bulk_create_params[:data][:attributes][:entries] = [
          { ip_or_cidr: 'not-an-ip' }
        ]
      end

      it 'returns unprocessable content' do
        post :bulk_create, params: bulk_create_params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'does not create any entries' do
        expect do
          post :bulk_create, params: bulk_create_params
        end.not_to change(ApplicationIpWhitelistEntry, :count)
      end
    end

    context 'when entries list is empty' do
      before do
        bulk_create_params[:data][:attributes][:entries] = []
      end

      it 'returns unprocessable content' do
        post :bulk_create, params: bulk_create_params
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'does not create any entries' do
        expect do
          post :bulk_create, params: bulk_create_params
        end.not_to change(ApplicationIpWhitelistEntry, :count)
      end
    end

    context 'when entries param is missing' do
      before { bulk_create_params[:data][:attributes].delete(:entries) }

      it 'returns unprocessable content' do
        post :bulk_create, params: bulk_create_params
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'DELETE #destroy' do
    let!(:entry) { create(:application_ip_whitelist_entry, application_setting: setting) }

    it 'removes the entry' do
      expect do
        delete :destroy, params: { application_id: application.id, id: entry.id }
      end.to change(ApplicationIpWhitelistEntry, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  private

  def parsed_response
    JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody
  end
end
