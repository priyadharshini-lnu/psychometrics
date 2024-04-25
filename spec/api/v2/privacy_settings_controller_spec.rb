# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::PrivacySettingsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:project) { create(:project, subdomain: 'project-subdomain') }

  let!(:privacy_setting_recotrd) do
    create(:privacy_setting, project_id: project.id)
  end
  let!(:project_membership) { create(:project_admin_membership, client: project) }
  let!(:project_id) { privacy_setting_recotrd.project_id }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(project_membership.user) }

  path '/projects/{project_id}/privacy_settings' do
    get 'Privacy Setting' do
      operationId 'PrivacySetting'
      description 'Fetch PrivacySetting'
      tags 'PrivacySetting'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :'filter[project_id_eq]', in: :query, required: true

      response '200', 'PrivacySetting' do
        schema '$ref' => '#/components/schemas/PrivacySettingListRespose'

        examples 'application/json' => [{}]

        let!(:'filter[project_id_eq]') { project_id }

        run_test! do |response|
          privacy_setting_response = JSON.parse(response.body)['data'].last
          expect(response.status).to eq(200)
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
        end
      end
    end
  end
end
