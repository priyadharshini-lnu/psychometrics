# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::OrderedAssessments do
  let(:campaign1) { create(:campaign, status: :active) }
  let(:campaign2) { create(:campaign, project_id: campaign1.project_id, status: :active) }
  let(:user) { create(:user, project_id: campaign1.project_id) }
  let!(:campaign_user1) { create(:campaign_user, campaign: campaign1, user: user) }
  let!(:campaign_user2) { create(:campaign_user, campaign: campaign2, user: user) }

  it "doesn't return result for inactive campaign" do
    campaign1.update!(status: :inactive)
    campaign1_group = create(:campaign_assessment_group, campaign: campaign1, position: 1)
    campaign2_group = create(:campaign_assessment_group, campaign: campaign2, position: 1)
    campaign1_assessment = create(:campaign_assessment, campaign_assessment_group: campaign1_group, position: 1)
    campaign2_assessment = create(:campaign_assessment, campaign_assessment_group: campaign2_group, position: 1)

    _ua1 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_assessment.assessment
    )
    ua2 = create(
      :user_assessment, campaign: campaign2, subject: user, evaluator: user,
      assessment: campaign2_assessment.assessment
    )

    result = described_class.call!(user)
    expect(result).to eq([ua2])
  end

  it 'only brings user assessment of passed campaign' do
    campaign1_group = create(:campaign_assessment_group, campaign: campaign1, position: 1)
    campaign2_group = create(:campaign_assessment_group, campaign: campaign2, position: 1)
    campaign1_assessment = create(:campaign_assessment, campaign_assessment_group: campaign1_group, position: 1)
    campaign2_assessment = create(:campaign_assessment, campaign_assessment_group: campaign2_group, position: 1)

    ua1 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_assessment.assessment
    )
    _ua2 = create(
      :user_assessment, campaign: campaign2, subject: user, evaluator: user,
      assessment: campaign2_assessment.assessment
    )

    result = described_class.call!(user, campaign1.id)
    expect(result).to eq([ua1])
  end

  it 'orders assessments as per sequencing logic with multiple campaign and groups' do
    campaign1_group1 = create(:campaign_assessment_group, campaign: campaign1, position: 2)
    campaign1_group2 = create(:campaign_assessment_group, campaign: campaign1, position: 1)
    campaign2_group1 = create(:campaign_assessment_group, campaign: campaign2, position: 1)

    campaign1_assessment1 = create(:campaign_assessment, campaign_assessment_group: campaign1_group1, position: 1)
    campaign1_assessment2 = create(:campaign_assessment, campaign_assessment_group: campaign1_group1, position: 2)
    campaign1_assessment3 = create(:campaign_assessment, campaign_assessment_group: campaign1_group2, position: 2)
    campaign1_assessment4 = create(:campaign_assessment, campaign_assessment_group: campaign1_group2, position: 1)

    campaign1_ungrouped_assessment1 = create(:campaign_assessment, campaign_assessment_group: nil, position: 2)
    campaign1_ungrouped_assessment2 = create(:campaign_assessment, campaign_assessment_group: nil, position: 1)

    campaign2_assessment1 = create(:campaign_assessment, campaign_assessment_group: campaign2_group1, position: 1)
    campaign2_assessment2 = create(:campaign_assessment, campaign_assessment_group: campaign2_group1, position: 2)

    ua1 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_assessment1.assessment
    )
    ua2 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_assessment2.assessment
    )
    ua3 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_assessment3.assessment
    )
    ua4 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_assessment4.assessment
    )
    ua5 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_ungrouped_assessment1.assessment
    )
    ua6 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user,
      assessment: campaign1_ungrouped_assessment2.assessment
    )
    ua7 = create(
      :user_assessment, campaign: campaign1, subject: user, evaluator: user
    )
    ua8 = create(
      :user_assessment, campaign: campaign2, subject: user, evaluator: user,
       assessment: campaign2_assessment1.assessment
    )
    ua9 = create(
      :user_assessment, campaign: campaign2, subject: user, evaluator: user,
      assessment: campaign2_assessment2.assessment
    )

    result = described_class.call!(user)
    expect(result).to eq([ua8, ua9, ua3, ua4, ua1, ua2, ua5, ua6, ua7])
  end
end
