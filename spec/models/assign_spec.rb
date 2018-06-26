require 'rails_helper'

RSpec.describe Assign, type: :model do
  let!(:membership) { create(:membership) }
  let!(:report) { membership.client.reports.first }
  let!(:license) { create(:license, client: membership.client.root, used_number: 0, report_family: report.report_families.take) }

  describe 'user_access' do
    it 'responds to user_access' do
      assign = build(:assign, membership: membership)
      expect(assign).to respond_to(:user_access)
    end

    context 'when user_access is true' do
      let!(:assign) { create(:assign, membership: membership, user_access: true, reports: [report]) }

      it 'sets user_access for assigns_reports' do
        expect(assign.reload.assigns_reports.first.user_access).to be true
      end
    end

    context 'when user_access is false' do
      let!(:assign) { create(:assign, membership: membership, user_access: false, reports: [report]) }

      it 'sets user_access for assigns_reports' do
        expect(assign.reload.assigns_reports.first.user_access).to be false
      end
    end
  end
end
