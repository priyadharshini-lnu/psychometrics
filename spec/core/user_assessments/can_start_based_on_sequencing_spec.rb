# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::CanStartBasedOnSequencing do
  let(:campaign) { create(:campaign, status: :active) }
  let(:user) { create(:user, project_id: campaign.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  it 'returns false if previous assessment needs to be completed but it is not' do
    campaign_group = create(:campaign_assessment_group, campaign: campaign, position: 1,
previous_assessments_required: true)
    campaign_group_assessment1 = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group, position: 1
    )
    campaign_group_assessment2 = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group, position: 2
    )
    _ua1 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group_assessment1.assessment, status: :not_started
    )
    ua2 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group_assessment2.assessment
    )

    expect(described_class.call!(ua2)).to eq(false)
  end

  it 'returns false if previous group needs to be completed but some assessment in previous group is incomplete' do
    campaign_group1 = create(:campaign_assessment_group, campaign: campaign, position: 1)
    campaign_group2 = create(:campaign_assessment_group, campaign: campaign, position: 2, previous_group_required: true)
    campaign_group1_assessment = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group1, position: 1
    )
    campaign_group2_assessment1 = create(
      :campaign_assessment, campaign_assessment_group: campaign_group2, campaign: campaign, position: 1
    )
    campaign_group2_assessment2 = create(
      :campaign_assessment, campaign_assessment_group: campaign_group2, campaign: campaign, position: 1
    )
    _ua1 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group1_assessment.assessment, status: :in_progress
    )
    _ua2 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group2_assessment1.assessment, status: :completed
    )
    ua3 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group2_assessment2.assessment
    )

    expect(described_class.call!(ua3)).to eq(false)
  end

  it 'returns true if all previous assessments are completed' do
    campaign_group = create(
      :campaign_assessment_group, campaign: campaign, position: 1, previous_assessments_required: true
    )
    campaign_group_assessment1 = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group, position: 1
    )
    campaign_group_assessment2 = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group, position: 2
    )
    _ua1 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group_assessment1.assessment, status: :completed
    )
    ua2 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group_assessment2.assessment
    )

    expect(described_class.call!(ua2)).to eq(true)
  end

  it 'returns true if all previous assessments completed and previous group assessments completed' do
    campaign_group1 = create(:campaign_assessment_group, campaign: campaign, position: 1)
    campaign_group2 = create(
      :campaign_assessment_group, campaign: campaign, position: 2, previous_assessments_required: true,
      previous_group_required: true
    )
    campaign_group1_assessment = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group1, position: 1
    )
    campaign_group2_assessment1 = create(
      :campaign_assessment, campaign_assessment_group: campaign_group2, campaign: campaign, position: 1
    )
    campaign_group2_assessment2 = create(
      :campaign_assessment, campaign_assessment_group: campaign_group2, campaign: campaign, position: 1
    )
    _ua1 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group1_assessment.assessment, status: :completed
    )
    _ua2 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group2_assessment1.assessment, status: :timed_out
    )
    ua3 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group2_assessment2.assessment
    )

    expect(described_class.call!(ua3)).to eq(true)
  end

  it 'returns true if previous_group_required and previous_assessments_required are false' do
    campaign_group1 = create(:campaign_assessment_group, campaign: campaign, position: 1)
    campaign_group2 = create(
      :campaign_assessment_group, campaign: campaign, position: 2, previous_assessments_required: false,
      previous_group_required: false
    )
    campaign_group1_assessment = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group1, position: 1
    )
    campaign_group2_assessment1 = create(
      :campaign_assessment, campaign_assessment_group: campaign_group2, campaign: campaign, position: 1
    )
    campaign_group2_assessment2 = create(
      :campaign_assessment, campaign_assessment_group: campaign_group2, campaign: campaign, position: 1
    )
    _ua1 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group1_assessment.assessment, status: :not_started
    )
    _ua2 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group2_assessment1.assessment, status: :interrupted
    )
    ua3 = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group2_assessment2.assessment
    )

    expect(described_class.call!(ua3)).to eq(true)
  end

  it 'returns true for assessment at position 1 if previous_assessments_required is true' do
    campaign_group = create(
      :campaign_assessment_group, campaign: campaign, position: 1, previous_assessments_required: true
    )
    campaign_group_assessment = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group, position: 1
    )
    ua = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group_assessment.assessment, status: :not_started
    )

    expect(described_class.call!(ua)).to eq(true)
  end

  it 'returns true when previous_group_required is true but previous group position is missing' do
    campaign_group = create(
      :campaign_assessment_group, campaign: campaign, position: 2, previous_group_required: true
    )
    campaign_group_assessment = create(
      :campaign_assessment, campaign: campaign, campaign_assessment_group: campaign_group, position: 1
    )
    user_assessment = create(
      :user_assessment, campaign: campaign, subject: user, evaluator: user,
      assessment: campaign_group_assessment.assessment, status: :not_started
    )

    expect(described_class.call!(user_assessment)).to eq(true)
  end
end
