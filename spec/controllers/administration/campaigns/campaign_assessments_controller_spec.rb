# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::CampaignAssessmentsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let(:assessment) { create(:assessment) }
  let(:report_family) { report.report_families.first }
  let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign, name: 'Group') }
  let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, position: 1) }

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  it 'update' do
    put :update, params: {
      id: campaign_assessment.id,
      new_campaign_id: campaign.id,
      resource: { campaign_assessment_group_id: campaign_assessment_group.id, position: 4 }
    }

    parsed_response = response.parsed_body

    expect(parsed_response['campaign_assessment_group_id']).to eq campaign_assessment_group.id
    expect(parsed_response['position']).to eq 4
    expect(campaign_assessment.reload.position).to eq 4
  end

  it 'update_positions' do
    assessment1 = create(:assessment)
    assessment2 = create(:assessment)
    ca1 = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id, assessment: assessment1)
    ca2 = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id, assessment: assessment2)

    post :update_positions, params: {
      campaign_assessments: [
        {
          id: ca1.id,
          position: 3,
          campaign_assessment_group_id: campaign_assessment_group.id
        },
        {
          id: ca2.id,
          position: 6,
          campaign_assessment_group_id: nil
        }

      ],
      new_campaign_id: campaign.id
    }
    expect(response).to have_http_status(:success)
    expect(ca1.reload.position).to eq 3
    expect(ca2.reload.position).to eq 6
    expect(ca2.reload.campaign_assessment_group_id).to be_nil
  end

  it 'will not update_positions for other campaign' do
    other_campaign = create(:campaign)

    ca = campaign_assessment_group.campaign_assessments.create(campaign_id: campaign.id)

    post :update_positions, params: {
      campaign_assessments: [
        {
          id: ca.id,
          position: 3,
          campaign_assessment_group_id: campaign_assessment_group.id
        }
      ],
      new_campaign_id: other_campaign.id
    }
    expect(response).to have_http_status(400)
    expect(ca.reload.position).to eq 1
    expect(ca.reload.campaign_assessment_group_id).to eq campaign_assessment_group.id
  end

  it 'saves workshop activity duration' do
    assessment = create(:assessment)
    ca = campaign_assessment_group.campaign_assessments.create(
      campaign_id: campaign.id,
      assessment: assessment,
      workshop_activity_duration: 20
    )

    post :update_positions, params: {
      campaign_assessments: [
        {
          id: ca.id,
          position: 2,
          campaign_assessment_group_id: campaign_assessment_group.id,
          workshop_activity_duration: 45
        }
      ],
      new_campaign_id: campaign.id
    }

    expect(response).to have_http_status(:success)
    expect(ca.reload.workshop_activity_duration).to eq 45
  end

  it 'return error when duration is invalid' do
    assessment = create(:assessment)
    campaign_assessment_group.update!(group_type: :assessment_center)
    ca = campaign_assessment_group.campaign_assessments.create(
      campaign_id: campaign.id,
      assessment: assessment,
      workshop_activity_duration: 20
    )

    post :update_positions, params: {
      campaign_assessments: [
        {
          id: ca.id,
          position: 2,
          campaign_assessment_group_id: campaign_assessment_group.id,
          workshop_activity_duration: -5
        }
      ],
      new_campaign_id: campaign.id
    }

    expect(response).to have_http_status(400)
    expect(ca.reload.workshop_activity_duration).to eq 20
  end

  describe '#update_occupation_condition_set' do
    let(:dimension) { create(:dimension, occupations_enabled: true) }
    let(:assessment) { create(:assessment, dimension: dimension) }
    let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
    let(:new_condition_set) { create(:occupation_condition_set, dimension: dimension, name: 'New Set') }

    it 'updates the condition set and applies to existing users if requested' do
      expect(CampaignAssessments::UpdateOccupationConditionSet).to receive(:call).with(
        campaign_assessment,
        new_condition_set.id.to_s,
        true
      ).and_call_original

      post :update_occupation_condition_set, params: {
        id: campaign_assessment.id,
        new_campaign_id: campaign.id,
        campaign_assessment: { occupation_condition_set_id: new_condition_set.id },
        apply_to_existing_users: 'true'
      }

      expect(response).to have_http_status(:success)
      expect(campaign_assessment.reload.occupation_condition_set_id).to eq(new_condition_set.id)
    end
  end
end
