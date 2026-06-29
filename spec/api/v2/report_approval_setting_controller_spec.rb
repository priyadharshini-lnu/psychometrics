# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ReportApprovalSettingsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:campaign_id) { campaign.id }
  before { sign_in(superadmin) }

  describe 'GET /campaigns/:campaign_id/report_approval_settings' do
    it 'fetches ReportApprovalSetting List' do
      admins = create_list(:client_admin, 4)
      report_approval_setting = create(
        :report_approval_setting, qc_user_ids: [admins[0].id], approver_user_ids: [admins[1].id],
        approval_notification_user_ids: [admins[2].id, admins[3].id], campaign_id: campaign_id
      )

      get "/api/v2/administration/campaigns/#{campaign_id}/report_approval_settings",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

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

  describe 'POST /campaigns/:campaign_id/report_approval_settings' do
    it 'creates a report_approval_settings' do
      report = create(:report)
      admins = create_list(:client_admin, 4)
      admins.each do |admin|
        create(:membership, user_id: admin.id, client_id: campaign.client.id, role: :client_admin)
      end

      body = jsonapi_resource_request(
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

      post "/api/v2/administration/campaigns/#{campaign_id}/report_approval_settings",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

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

  describe 'PATCH /campaigns/:campaign_id/report_approval_settings/:report_approval_setting_id' do
    it 'updates a report_approval_settings' do
      campaign = create(:campaign)
      report = create(:report)
      admin = create(:client_admin)
      create(:membership, user_id: admin.id, client_id: campaign.client.id, role: :client_admin)
      report_approval_setting = create(:report_approval_setting, campaign: campaign)

      body = jsonapi_resource_request(
        'report_approval_settings',
        { id: report_approval_setting.id.to_s, qc_user_ids: [admin.id] },
        {
          report: { id: report.id.to_s, type: 'reports' }
        }
      )

      patch "/api/v2/administration/campaigns/#{campaign.id}/report_approval_settings/#{report_approval_setting.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      data = JSON.parse(response.body)['data']
      expect(data).to have_key('id')
      expect(data).to have_attribute(:qcs).with_value([
        { 'id' => admin.id.to_s, 'email' => admin.email, 'name' => admin.name }
      ])
      expect(data).to have_relationship(:report).
        with_data({ 'id' => report.id.to_s, 'type' => 'reports' })
    end
  end

  describe 'DELETE /campaigns/:campaign_id/report_approval_settings/:report_approval_setting_id' do
    it 'deletes a report_approval_setting' do
      campaign = create(:campaign)
      report_approval_setting = create(:report_approval_setting, campaign: campaign)

      delete "/api/v2/administration/campaigns/#{campaign.id}/report_approval_settings/#{report_approval_setting.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response.body).to be_empty
      expect(ReportApprovalSetting.find_by(id: report_approval_setting.id)).to eq(nil)
    end
  end
end
