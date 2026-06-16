# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ReportApprovalSettingsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /report_approvals' do
    it 'fetches ReportApprovalSetting list' do
      ras = create(:report_approval_setting, qc_user_ids: [1, 2], approver_user_ids: [3, 4])
      report_approval = create(:report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id)
      create(:report_approval, campaign_id: ras.campaign_id)

      get '/api/v2/administration/report_approvals/',
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)['data']
      report_approval_response = data.find { |d| d['id'] == report_approval.id.to_s }
      expect(report_approval_response).to have_key('id')
      expect(report_approval_response).to have_attribute(:qc_user_ids).with_value([1, 2])
      expect(report_approval_response).to have_attribute(:approver_user_ids).with_value([3, 4])

      expect(report_approval_response).to have_relationship(:campaign).
        with_data({ 'id' => report_approval.campaign_id.to_s, 'type' => 'campaigns' })
      expect(report_approval_response).to have_relationship(:report).
        with_data({ 'id' => report_approval.report_id.to_s, 'type' => 'reports' })
    end
  end
end

RSpec.describe Api::V2::Administration::ReportApprovalsController, type: :controller do
  let(:super_admin) { create(:superadmin) }
  let(:client_admin) { create(:client_admin) }

  describe 'search_campaign' do
    it 'searches campaign by name among all report approval setting for super admin' do
      sign_in(super_admin)
      campaign1 = create(:campaign, name: 'Intel')
      campaign2 = create(:campaign, name: 'Nvida')
      ras1 = create(:report_approval_setting, campaign: campaign1)
      ras2 = create(:report_approval_setting, campaign: campaign2)
      [ras1, ras2].each do |ras|
        create(:report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id)
      end
      get :search_campaign, params: { filter: { filterable_fields: 'Int' } }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to eq([{ 'id' => campaign1.id, 'name' => campaign1.name }])
    end

    it 'searches campaign by name among all report approval setting where campaign admin is added as qc or approver' do
      sign_in(client_admin)
      campaign1 = create(:campaign, name: 'Intel')
      campaign2 = create(:campaign, name: 'Nvida')
      campaign3 = create(:campaign)
      ras1 = create(:report_approval_setting, campaign: campaign1, qc_user_ids: [client_admin.id])
      ras2 = create(:report_approval_setting, campaign: campaign2, approver_user_ids: [client_admin.id])
      ras3 = create(:report_approval_setting, campaign: campaign2)
      ras4 = create(:report_approval_setting, campaign: campaign3)
      [ras1, ras2, ras3, ras4].each do |ras|
        create(:report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id)
      end

      get :search_campaign, params: { filterable_fields: 'Int' }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to match_array([campaign1, campaign2].map { |c| c.slice(:id, :name) })
    end
  end

  describe 'search_report' do
    it 'searches report by name among all report approval setting for super admin' do
      sign_in(super_admin)
      report1 = create(:report, name: 'Intel')
      report2 = create(:report, name: 'Nvida')
      ras1 = create(:report_approval_setting, report: report1)
      ras2 = create(:report_approval_setting, report: report2)
      [ras1, ras2].each do |ras|
        create(:report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id)
      end

      get :search_report, params: { filter: { filterable_fields: 'Int' } }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to eq([{ 'id' => report1.id, 'name' => report1.name }])
    end

    it 'searches report by name among all report approval setting where report admin is added as qc or approver' do
      sign_in(client_admin)
      report1 = create(:report, name: 'Intel')
      report2 = create(:report, name: 'Nvida')
      report3 = create(:report)
      ras1 = create(:report_approval_setting, report: report1, qc_user_ids: [client_admin.id])
      ras2 = create(:report_approval_setting, report: report2, approver_user_ids: [client_admin.id])
      ras3 = create(:report_approval_setting, report: report2)
      ras4 = create(:report_approval_setting, report: report3)
      [ras1, ras2, ras3, ras4].each do |ras|
        create(:report_approval, campaign_id: ras.campaign_id, report_id: ras.report_id)
      end

      get :search_report, params: { filterable_fields: 'Int' }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to match_array([report1, report2].map { |r| r.slice(:id, :name) })
    end
  end

  describe 'search_user' do
    it 'searches user by name among all report approval setting for super admin' do
      sign_in(super_admin)
      user1 = create(:user, first_name: 'Jack')
      user2 = create(:user, first_name: 'Gin')
      ras1 = create(:report_approval_setting)
      ras2 = create(:report_approval_setting)
      create(:report_approval, user_id: user1.id, report_id: ras1.report_id, campaign_id: ras1.campaign_id)
      create(:report_approval, user_id: user2.id, report_id: ras2.report_id, campaign_id: ras2.campaign_id)

      get :search_user, params: { filter: { filterable_fields: 'Ja' } }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to eq([{ 'id' => user1.id, 'name' => user1.decorate.display_name,
                                       'email' => user1.email }])
    end

    it 'searches user by name among all report approval setting where user admin is added as qc or approver' do
      sign_in(client_admin)
      user1 = create(:user, first_name: 'Jack')
      user2 = create(:user, first_name: 'James')
      ras1 = create(:report_approval_setting, qc_user_ids: [client_admin.id])
      ras2 = create(:report_approval_setting)
      create(:report_approval, user_id: user1.id, report_id: ras1.report_id, campaign_id: ras1.campaign_id)
      create(:report_approval, user_id: user2.id, report_id: ras2.report_id, campaign_id: ras2.campaign_id)

      get :search_user, params: { filterable_fields: 'Ja' }
      parsed_response = JSON.parse(response.body)

      expect(parsed_response).to match_array([{ 'id' => user1.id, 'name' => user1.decorate.display_name,
                                                'email' => user1.email }])
    end
  end
end
