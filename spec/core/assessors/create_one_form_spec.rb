# frozen_string_literal: true

require 'rails_helper'

describe Assessors::CreateOneForm do
  let(:super_admin) { create(:superadmin) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:assessment1) do
    create(:assessment, category: :assessor_form, owner_id: project.parent.id, created_by: super_admin)
  end
  let(:assessment2) do
    create(:assessment, category: :assessor_form, owner_id: project.parent.id, created_by: super_admin)
  end

  it 'invalid emails' do
    form = described_class.new(subject_email: 'accc')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:subject_email]).to include('Subject Email is invalid')
    expect(form.errors.messages[:assessor_email]).to include('Assessor Email is invalid')
  end

  it 'already existing subject+assessor connection' do
    relationship = create(:relationship, name: Relationship::ASSESSOR)
    user_assessment = create(:user_assessment, campaign: campaign, subject_id: create(:user, email: 'a@a.com'),
           evaluator_id: create(:user, email: 'b@b.com'), relationship: relationship)
    form = described_class.new(
      subject_email: 'a@a.com', evaluator_email: 'b@b.com', assessment_ids: [user_assessment.assessment_id]
    )
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:assessor_email]).to include('The subject with this assessor are already connected')
  end

  it 'invalid assessment_ids' do
    form = described_class.new(assessment_ids: [1, 2])
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:assessment_ids]).to include('Assessment 1 can\'t be attached to an assessor')
  end

  it 'valid form' do
    create(:relationship, name: Relationship::ASSESSOR)
    user = create(:user, email: 'sub@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    campaign.users.create(email: 'sub@gmail.com')

    form = described_class.new(
      assessment_ids: [assessment1.id, assessment2.id],
      assessor_first_name: 'Nick',
      assessor_last_name: 'Diaz',
      assessor_email: 'diaz@gmail.com',
      subject_email: 'sub@gmail.com'
    )
    form.with_context(campaign: campaign)
    expect(form.validate).to eq(true)
  end
end
