# frozen_string_literal: true

require 'rails_helper'

describe Assessors::UserAssessments::Form do
  let(:assessor) { create(:assessor) }
  let(:campaign) { assessor.campaign }
  let(:subject_user) { create(:user) }
  let(:assessment) { create(:assessment) }
  let!(:assessor_relationship) { create(:relationship, name: Relationship::ASSESSOR, type: :global) }

  it 'checks for duplicate assessment and subject pair for the assessment' do
    create(:user_assessment, subject: subject_user, evaluator_id: assessor.user_id,
      assessment: assessment, campaign: campaign, relationship: assessor_relationship)

    form = Assessors::UserAssessments::Form.new(
      subject_id: subject_user.id,
      assessment_id: assessment.id
    ).with_context(campaign: campaign, assessor: assessor)

    expect(form.valid?).to eq(false)
    expect(form.errors[:base]).to eq(['Assessment and subject pair already exists'])
  end
end
