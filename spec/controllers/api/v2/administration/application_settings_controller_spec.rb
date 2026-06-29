# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ApplicationSettingsController, type: :controller do
  let(:tenant) { create(:tenancy) }
  let(:superadmin) { create(:superadmin) }
  let(:application) { create(:application_user, tenant: tenant) }

  before do
    sign_in superadmin
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  describe 'GET #index' do
    context 'when application setting already exists' do
      let(:setting) { application.application_setting }

      it 'returns the existing setting' do
        get :index, params: { application_id: application.id }

        expect(response).to have_http_status(:ok)
        expect(parsed_response['data'].first['id'].to_i).to eq(setting.id)
      end
    end
  end

  describe 'PATCH #update' do
    let(:setting) do
      application.application_setting.tap { |s| s.update_column(:ip_whitelisting_enabled, false) }
    end

    let(:update_params) do
      {
        application_id: application.id,
        id: setting.id,
        data: {
          type: 'application_settings',
          id: setting.id.to_s,
          attributes: { ip_whitelisting_enabled: true }
        }
      }
    end

    context 'when enabling with at least one enabled IP entry' do
      before { create(:application_ip_whitelist_entry, application_setting: setting) }

      it 'updates ip_whitelisting_enabled' do
        patch :update, params: update_params
        expect(setting.reload.ip_whitelisting_enabled).to be true
      end

      it 'returns success' do
        patch :update, params: update_params
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when enabling with no enabled IP entries' do
      it 'returns unprocessable content' do
        patch :update, params: update_params
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'does not update the setting' do
        patch :update, params: update_params
        expect(setting.reload.ip_whitelisting_enabled).to be false
      end
    end
  end

  private

  def parsed_response
    JSON.parse(response.body) # rubocop:disable Rails/ResponseParsedBody
  end
end
