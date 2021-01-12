# frozen_string_literal: true

require 'rails_helper'

describe Assessors::UserAssessments::Create do
  let(:assessor) { create(:assessor) }
  let(:campaign) { assessor.campaign }
  let(:subject_user) { create(:user) }
  let(:assessment) { create(:assessment) }
  let!(:assessor_relationship) { create(:relationship, name: Relationship::ASSESSOR, type: :global) }

  it 'create user_assessment with user_result' do
    form = Assessors::UserAssessments::Form.new(
      subject_id: subject_user.id,
      assessment_id: assessment.id
    ).with_context(campaign: campaign, assessor: assessor)

    user_assessment = described_class.call!(form)
    user_result = user_assessment.users_result

    expect(user_assessment.assessment_id).to eq(assessment.id)
    expect(user_assessment.evaluator_id).to eq(assessor.user_id)
    expect(user_assessment.subject_id).to eq(subject_user.id)
    expect(user_assessment.relationship_id).to eq(assessor_relationship.id)
    expect(user_result.assessment_id).to eq(assessment.id)
    expect(user_result.evaluator_id).to eq(assessor.user_id)
    expect(user_result.subject_id).to eq(subject_user.id)
  end
end
