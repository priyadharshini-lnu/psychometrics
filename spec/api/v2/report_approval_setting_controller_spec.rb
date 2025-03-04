# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ReportApprovalSettingsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:campaign_id) { campaign.id }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/campaigns/{campaign_id}/report_approval_settings/' do
    get 'ReportApprovalSetting List' do
      operationId 'ReportApprovalSettingList'
      description 'Fetch ReportApprovalSetting List'

      tags 'ReportApprovalSetting'
      consumes 'application/json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string

      response '200', 'ReportApprovalSetting list' do
        let(:admins) { create_list(:client_admin, 4) }
        let!(:report_approval_setting) do
          create(
            :report_approval_setting, qc_user_ids: [admins[0].id], approver_user_ids: [admins[1].id],
            approval_notification_user_ids: [admins[2].id, admins[3].id], campaign_id: campaign_id
          )
        end

        schema '$ref' => '#/components/schemas/ReportApprovalSettingListResponse'

        examples 'application/json' => [{
          type: 'report_approval_settings',
          data: {
            id: '770',
            attributes: {
              qc_user_ids: [1, 2],
              approver_user_ids: [3, 4],
              approval_notification_user_ids: [4, 5]
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              },
              report: {
                data: {
                  id: '2',
                  type: 'reports'
                }
              }
            }
          }
        }]

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          report_approval_settings_response = data.find { |d| d['id'] == report_approval_setting.id.to_s }
          expect(report_approval_settings_response).to have_key('id')
          expect(report_approval_settings_response).to have_attribute(:qcs).with_value([
            { 'id' => admins[0].id.to_s, 'email' => admins[0].email, 'name' => admins[0].name }
          ])
          expect(report_approval_settings_response).to have_attribute(:approvers).with_value([
            { 'id' => admins[1].id.to_s, 'email' => admins[1].email, 'name' => admins[1].name }
          ])
          expect(report_approval_settings_response).to have_attribute(:approval_notification_users).with_value([
            { 'id' => admins[2].id.to_s, 'email' => admins[2].email, 'name' => admins[2].name },
            { 'id' => admins[3].id.to_s, 'email' => admins[3].email, 'name' => admins[3].name }
          ])
          expect(report_approval_settings_response).to have_relationship(:campaign).
            with_data({ 'id' => report_approval_setting.campaign_id.to_s, 'type' => 'campaigns' })
          expect(report_approval_settings_response).to have_relationship(:report).
            with_data({ 'id' => report_approval_setting.report_id.to_s, 'type' => 'reports' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/report_approval_settings/' do
    let(:report) { create(:report) }
    let(:admins) do
      admins = create_list(:client_admin, 4)
      admins.each do |admin|
        create(:membership, user_id: admin.id, client_id: campaign.client.id, role: :client_admin)
      end
    end

    post 'Create a report_approval_settings' do
      operationId 'CreateReportApprovalSetting'
      description 'Create new ReportApprovalSetting'
      tags 'ReportApprovalSetting'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportApprovalSettingCreateRequest' },
                required: true

      response '201', 'ReportApprovalSetting Created' do
        schema '$ref' => '#/components/schemas/ReportApprovalSettingResponse'

        examples 'application/json' => {
          type: 'report_approval_settings',
          data: {
            attributes: {
              qc_user_ids: [1, 2],
              approver_user_ids: [3, 4],
              approval_notification_user_ids: [4, 5]
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              },
              report: {
                data: {
                  id: '2',
                  type: 'reports'
                }
              }
            }
          }
        }

        let(:body) do
          jsonapi_resource_request(
            'report_approval_settings',
            {
              qc_user_ids: [admins[0].id], approver_user_ids: [admins[1].id],
              approval_notification_user_ids: [admins[2].id, admins[3].id],
              approvers_can_edit: false,
              approvers_not_required: false,
              do_not_send_notifications: false
            },
            {
              report: { id: report.id.to_s, type: 'reports' }
            }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:qcs).with_value([
            { 'id' => admins[0].id.to_s, 'email' => admins[0].email, 'name' => admins[0].name }
          ])
          expect(data).to have_attribute(:approvers).with_value([
            { 'id' => admins[1].id.to_s, 'email' => admins[1].email, 'name' => admins[1].name }
          ])
          expect(data).to have_attribute(:approval_notification_users).with_value([
            { 'id' => admins[2].id.to_s, 'email' => admins[2].email, 'name' => admins[2].name },
            { 'id' => admins[3].id.to_s, 'email' => admins[3].email, 'name' => admins[3].name }
          ])
          expect(data).to have_relationship(:campaign).
            with_data({ 'id' => campaign.id.to_s, 'type' => 'campaigns' })
          expect(data).to have_relationship(:report).
            with_data({ 'id' => report.id.to_s, 'type' => 'reports' })
        end
      end
    end
  end

  path '/campaigns/{campaign_id}/report_approval_settings/{report_approval_setting_id}' do
    let(:campaign) { create(:campaign) }
    let(:report) { create(:report) }
    let(:admin) do
      admin = create(:client_admin)
      create(:membership, user_id: admin.id, client_id: campaign.client.id, role: :client_admin)
      admin
    end
    let(:report_approval_setting) { create(:report_approval_setting, campaign: campaign) }
    let(:report_approval_setting_id) { report_approval_setting.id }

    patch 'Update a report_approval_settings' do
      operationId 'UpdateReportApprovalSetting'
      description 'Update ReportApprovalSetting'
      tags 'ReportApprovalSetting'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :report_approval_setting_id, in: :path, type: :string
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ReportApprovalSettingUpdateRequest' },
                required: true

      response '200', 'ReportApprovalSetting Updated' do
        schema '$ref' => '#/components/schemas/ReportApprovalSettingResponse'

        examples 'application/json' => {
          type: 'report_approval_settings',
          data: {
            attributes: {
              qc_user_ids: [1, 2],
              approver_user_ids: [3, 4],
              approval_notification_user_ids: [4, 5]
            },
            relationships: {
              campaign: {
                data: {
                  id: '1',
                  type: 'campaigns'
                }
              },
              report: {
                data: {
                  id: '2',
                  type: 'reports'
                }
              }
            }
          }
        }

        let(:body) do
          jsonapi_resource_request(
            'report_approval_settings',
            { id: report_approval_setting.id.to_s, qc_user_ids: [admin.id] },
            {
              report: { id: report.id.to_s, type: 'reports' }
            }
          )
        end

        run_test! do |response|
          data = JSON.parse(response.body)['data']
          expect(data).to have_key('id')
          expect(data).to have_attribute(:qcs).with_value([
            { 'id' => admin.id.to_s, 'email' => admin.email, 'name' => admin.name }
          ])
          expect(data).to have_relationship(:report).
            with_data({ 'id' => report.id.to_s, 'type' => 'reports' })
        end
      end
    end

    delete 'Delete a report_approval_setting' do
      operationId 'DeleteReportApprovalSetting'
      description 'Delete a ReportApprovalSetting'
      tags 'ReportApprovalSetting'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :campaign_id, in: :path, type: :string
      parameter name: :report_approval_setting_id, in: :path, type: :string

      response '204', 'ReportApprovalSetting Deleted' do
        run_test! do |response|
          expect(response.body).to be_empty
          expect(ReportApprovalSetting.find_by(id: report_approval_setting_id)).to eq(nil)
        end
      end
    end
  end
end
