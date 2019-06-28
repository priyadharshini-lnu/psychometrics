require 'rails_helper'

RSpec.describe Assign, type: :model do
  context 'Scopes' do
    context '.with_status' do
      let(:campaign) { create(:campaign_base, :with_reports) }
      let(:report) { campaign.clients_reports.first.report }
      let(:assessment) { campaign.assessments_clients.first.assessment }
      let(:membership) { create(:membership, client: campaign) }
      let!(:assign) { create(:assign, assessment: assessment, membership: membership, status: 'not_started') }
      let(:membership_project) { create(:membership, client: campaign.project) }
      let!(:assign_project) { create(:assign, assessment: assessment, membership: membership_project, status: 'in_progress') }

      it 'returns by project assign status' do
        assign.project_assign.update_attribute(:status, described_class.statuses[:completed])
        base_query = described_class.joins(:membership).where(memberships: { client_id: campaign.id })
        expect(base_query.with_status(:completed).to_a).to include(assign)
      end

      it 'returns by original assign status' do
        base_query = described_class.joins(:membership).where(memberships: { client_id: campaign.project.id })
        expect(base_query.with_status(:in_progress).to_a).to include(assign_project)
      end
    end
  end
end
