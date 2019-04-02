require 'rails_helper'

describe Reports::PrepareDataForReport do

  describe '.call' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign) }
    let(:user) { create(:user, email: "a@a.com") }
    let!(:membership) { create(:membership, user: user, client: project) }
    let!(:assessment) { create(:assessment, :with_report, name: 'first assessment') }
    before do
      allow_any_instance_of(Assign).to receive(:relevant_assessment).and_return(true)
      create(:assign, membership: membership, assessment: assessment)
    end

    it do
      args = {
        project: project,
        campaign: campaign,
        subject: nil,
        membership: user.memberships.join_user.find_by(client_id: project.id),
        report: assessment.reports.first,
        locale: 'en',
      }

      data = described_class.call!(args)
      expect(JSON.parse(data[:user])["email"]).to eq 'a@a.com'
      expect(JSON.parse(data[:data])['assessments'].last["name"]).to eq 'first assessment'
      expect(data[:locales]).to eq "{}"
      expect(data[:results]).to eq "{}"
      expect(data[:available_translations]).to eq []
    end
  end
end
