# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::BuildStats do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :with_report, name: 'Super Assessment') }

  let!(:campaign_user) do
    create(:campaign_user, campaign: campaign, status: :completed)
  end

  let!(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment, status: :completed) }

  before do
    campaign.assessments = [assessment]
  end

  describe 'builds proper stats' do
    it do
      stats = Campaigns::BuildStats.call!(campaign)

      expect(stats[:users]['completed']).to eq 1
      expect(stats[:users]['total']).to eq 1
      expect(stats[:assessments]).to eq [{ 'id' => assessment.id,
                                           'name' => assessment.name, 'not_started' => 0, 'in_progress' => 0,
                                           'completed' => 1, 'interrupted' => 0, 'timed_out' => 0, 'ineligible' => 0 }]
    end
  end
end
