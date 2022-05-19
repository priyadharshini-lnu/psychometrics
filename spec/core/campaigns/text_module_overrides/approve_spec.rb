# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::TextModuleOverrides::Approve do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:user_report) do
    create(:user_report, report: report, user: campaign_user.user, campaign: campaign, approved: true)
  end
  let(:module_override) { create(:text_module_override) }

  describe 'broadcast ok' do
    subject { described_class.call!({ module_id: 1 }, current_user) }
    it 'should approve with new record' do
      text_override = described_class.call!({ module_id: 1 }, current_user)
      expect(text_override.content).to eq nil
      expect(text_override.approved).to eq true
    end

    it 'should approve with existing record' do
      described_class.call!({ id: module_override.id, module_id: 1 }, current_user)
      expect(module_override.reload.approved).to eq true
    end
  end
end
