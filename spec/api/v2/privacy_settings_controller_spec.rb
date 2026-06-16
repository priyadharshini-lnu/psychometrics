# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::PrivacySettingsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project, subdomain: 'project-subdomain') }

  let!(:privacy_setting_recotrd) do
    create(:privacy_setting, project_id: project.id)
  end
  let!(:project_membership) { create(:project_admin_membership, client: project) }
  let!(:project_id) { privacy_setting_recotrd.project_id }

  before { sign_in(project_membership.user) }

  describe 'GET /api/v2/administration/projects/:project_id/privacy_settings' do
    it 'returns privacy settings' do
      get "/api/v2/administration/projects/#{project_id}/privacy_settings",
          params: { 'filter[project_id_eq]' => project_id }

      expect(response).to have_http_status(:ok)
      privacy_setting_response = JSON.parse(response.body)['data'].last
      expect(privacy_setting_response).to have_key('id')
      expect(
        privacy_setting_response
      ).to have_attribute(:privacy_consent).with_value(privacy_setting_recotrd.privacy_consent)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :custom_privacy_policy_version
      ).with_value(privacy_setting_recotrd.custom_privacy_policy_version)
      expect(
        privacy_setting_response
      ).to have_attribute(:privacy_link_text).with_value(privacy_setting_recotrd.privacy_link_text)
      expect(
        privacy_setting_response
      ).to have_attribute(:privacy_link_url).with_value(privacy_setting_recotrd.privacy_link_url)
      expect(
        privacy_setting_response
      ).to have_attribute(:enable_privacy_link).with_value(privacy_setting_recotrd.enable_privacy_link)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_pearson
      ).with_value(privacy_setting_recotrd.mask_identity_for_pearson)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_saville
      ).with_value(privacy_setting_recotrd.mask_identity_for_saville)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_hogan
      ).with_value(privacy_setting_recotrd.mask_identity_for_hogan)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_iiht
      ).with_value(privacy_setting_recotrd.mask_identity_for_iiht)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_examus
      ).with_value(privacy_setting_recotrd.mask_identity_for_examus)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_mettl
      ).with_value(privacy_setting_recotrd.mask_identity_for_mettl)
      expect(privacy_setting_response).
        to have_attribute(:allow_video_call_recording).
        with_value(privacy_setting_recotrd.allow_video_call_recording)
      expect(privacy_setting_response).
        to have_attribute(:enable_video_call_recording_for_all_new_campaigns).
        with_value(privacy_setting_recotrd.enable_video_call_recording_for_all_new_campaigns)
      expect(privacy_setting_response).
        to have_attribute(:video_call_recording_expiry_in_seconds).
        with_value(privacy_setting_recotrd.video_call_recording_expiry_in_seconds)
      expect(
        privacy_setting_response
      ).to have_attribute(
        :mask_identity_for_mhs
      ).with_value(privacy_setting_recotrd.mask_identity_for_mhs)
    end
  end
end
