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
  let(:data) do
    jsonapi_resource_request(
      'report_approval_settings',
      {
        id: '100',
        qc_user_ids: [admin.id],
        approver_user_ids: [admin.id],
        approval_notification_user_ids: [admin.id],
        approvers_can_edit: false,
        approvers_not_required: false,
        do_not_send_notifications: false
      },
      { report: { id: '1', type: 'reports' } }
    )
  end

  shared_examples 'contract_common' do |contract_class|
    it "shows error is passed admins doesn't have access to campaign" do
      schema = contract_class.new.call(data, { campaign: non_accessible_campaign })

      expect(schema.failure?).to eq(true)
      expect(schema).to have_jsonapi_attr_error(
        qc_user_ids: ["Admins don't have access to the campaign."],
        approver_user_ids: ["Admins don't have access to the campaign."],
        approval_notification_user_ids: ["Admins don't have access to the campaign."]
      )
    end

    it 'schema passes for valid params' do
      schema = contract_class.new.call(data, { campaign: accessible_campaign })

      expect(schema.failure?).to eq(false)
    end
  end

  describe 'CreateContract' do
    include_examples 'contract_common', Api::V2::ReportApprovalSetting::CreateContract
  end

  describe 'UpdateContract' do
    include_examples 'contract_common', Api::V2::ReportApprovalSetting::UpdateContract
  end
end
