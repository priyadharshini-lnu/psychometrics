# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::ReportApprovalSetting::Contract do
  let(:accessible_campaign) { create(:campaign) }
  let(:non_accessible_campaign) { create(:campaign) }
  let(:admin) do
    admin = create(:client_admin)
    create(:membership, user_id: admin.id, client_id: accessible_campaign.client.id, role: :client_admin)
    admin
  end
  let(:valid_data) do
    jsonapi_resource_request(
      'report_approval_settings',
      {
        id: '100',
        qc_user_ids: [admin.id],
        approver_user_ids: [admin.id],
        approval_notification_user_ids: [admin.id]
      },
      { report: { id: '1', type: 'reports' }, campaign: { id: accessible_campaign.id.to_s, type: 'campaigns' } }
    )
  end

  let(:invalid_data) do
    jsonapi_merge_relationships(
      valid_data,
      campaign: { id: non_accessible_campaign.id.to_s }
    )
  end

  shared_examples 'contract_common' do |contract_class|
    it "shows error is passed admins doesn't have access to campaign" do
      schema = contract_class.new.call(invalid_data, {})

      expect(schema.failure?).to eq(true)
      expect(schema).to have_jsonapi_attr_error(
        qc_user_ids: ["Admins don't have access to the campaign"],
        approver_user_ids: ["Admins don't have access to the campaign"],
        approval_notification_user_ids: ["Admins don't have access to the campaign"]
      )
    end

    it 'schema passes for valid params' do
      schema = contract_class.new.call(valid_data, {})

      expect(schema.failure?).to eq(false)
    end
  end

  describe 'CreateContract' do
    include_examples 'contract_common', Api::V2::ReportApprovalSetting::CreateContract
  end

  describe 'UpdateContract' do
    include_examples 'contract_common', Api::V2::ReportApprovalSetting::UpdateContract

    it 'picks campaign from report_approval_setting record if campaign_id is not passed' do
      report_approval_setting = create(:report_approval_setting, campaign: non_accessible_campaign)

      data = jsonapi_merge_attributes(
        jsonapi_remove_relationships(valid_data, :campaign),
        { id: report_approval_setting.id.to_s }
      )
      schema = Api::V2::ReportApprovalSetting::UpdateContract.new.call(data, {})
      expect(schema).to have_jsonapi_attr_error(
        qc_user_ids: ["Admins don't have access to the campaign"],
        approver_user_ids: ["Admins don't have access to the campaign"],
        approval_notification_user_ids: ["Admins don't have access to the campaign"]
      )
    end
  end
end
