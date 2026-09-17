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

  let!(:inactive_campaign_user) do
    create(:campaign_user, campaign: campaign, status: :completed, active: false)
  end

  let!(:uat_campaign_user) do
    create(:campaign_user, campaign: campaign, status: :completed, user: create(:user, is_uat: true))
  end

  let!(:user_assessment) do
    create(
      :user_assessment,
      campaign: campaign,
      assessment: assessment,
      status: :completed,
      evaluator_id: campaign_user.user_id,
      subject_id: campaign_user.user_id
    )
  end

  before do
    campaign.assessments = [assessment]
  end

  describe 'builds proper stats' do
    context 'for active users' do
      let(:campaign_users_active_in) { [true] }
      it do
        stats = Campaigns::BuildStats.call!(campaign, campaign_users_active_in)
        expect(stats[:users]['completed']).to eq 1
        expect(stats[:users]['total']).to eq 1
        expect(stats[:assessments]).to eq [
          { 'id' => assessment.id,
            'name' => assessment.name, 'not_started' => 0, 'in_progress' => 0,
            'completed' => 1, 'interrupted' => 0, 'timed_out' => 0, 'ineligible' => 0 }
        ]
      end
    end

    context 'for inactive users' do
      let(:campaign_users_active_in) { [false] }
      it do
        stats = Campaigns::BuildStats.call!(campaign, campaign_users_active_in)

        expect(stats[:users]['completed']).to eq 1
        expect(stats[:users]['total']).to eq 1
        expect(stats[:assessments]).to eq []
      end
    end
  end
end
