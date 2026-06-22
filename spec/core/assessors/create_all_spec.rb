# frozen_string_literal: true

require 'rails_helper'
describe Assessors::CreateAll do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:user) do
    create(:user, project: nil, email: 'existing.atanov@gmail.com', first_name: 'Existed', last_name: 'User')
  end
  let(:assessment1) { create(:assessment, category: :assessor_form) }
  let(:assessment2) { create(:assessment, category: :assessor_form) }
  let!(:subject1) do
    user = create(:user, project: project, email: 'fedor@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    user
  end
  let!(:subject2) do
    user = create(:user, project: project, email: 'ivan@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    user
  end
  let(:params) do
    [
      {
        assessor_email: 'existing.atanov@gmail.com',
        assessor_password: 'Password@2143',
        assessor_first_name: 'Vlad',
        assessor_last_name: 'Ata',
        subject_email: 'fedor@gmail.com',
        assessment_ids: [assessment1.id]
      },
      {
        assessor_email: 'unexising.atanov@gmail.com',
        assessor_first_name: 'Vlad',
        assessor_password: 'Password@2143',
        assessor_last_name: 'Ata',
        subject_email: 'ivan@gmail.com',
        assessment_ids: [assessment1.id, assessment2.id]
      }
    ]
  end
  it 'existing assessor user' do
    create(:relationship, name: Relationship::ASSESSOR, type: :global)
    new_assessors, existing_assessors_whose_password_not_changed = described_class.call!(
      params, campaign, create(:user)
    )
    expect(new_assessors.size).to eq(2)
    expect(existing_assessors_whose_password_not_changed.first.email).to eq('existing.atanov@gmail.com')
    assessor_user = User.find_by(email: 'existing.atanov@gmail.com')
    assessor = Assessor.exists?(user: assessor_user, campaign: campaign)
    expect(assessor_user.first_name).to eq('Existed')
    expect(assessor_user.last_name).to eq('User')
    expect(assessor).to be true
    user_assessment = UserAssessment.find_by(evaluator: assessor_user, subject: subject1)
    expect(user_assessment.relationship.name).to eq(Relationship::ASSESSOR.to_s)
    expect(user_assessment.assessment_id).to eq(assessment1.id)
  end
  it 'not-existing assessor user' do
    create(:relationship, name: Relationship::ASSESSOR, type: :global)
    described_class.call!(params, campaign, create(:user))
    assessor_user = User.find_by(email: 'unexising.atanov@gmail.com')
    assessor = Assessor.exists?(user: assessor_user, campaign: campaign)
    expect(assessor_user.first_name).to eq('Vlad')
    expect(assessor_user.last_name).to eq('Ata')
    expect(assessor).to be true
    user_assessment1 = UserAssessment.find_by(evaluator: assessor_user, subject: subject2, assessment: assessment1)
    user_assessment2 = UserAssessment.find_by(evaluator: assessor_user, subject: subject2, assessment: assessment1)
    expect(user_assessment1.relationship.name).to eq(Relationship::ASSESSOR.to_s)
    expect(user_assessment2.relationship.name).to eq(Relationship::ASSESSOR.to_s)
  end
  it 'creates a client assessor membership for each assessor user on the campaign client' do
    create(:relationship, name: Relationship::ASSESSOR, type: :global)
    described_class.call!(params, campaign, create(:user))
    existing_user_membership = Membership.find_by(
      user: User.find_by(email: 'existing.atanov@gmail.com'),
      client: campaign.client,
      role: Membership::CLIENT_ASSESSOR_ROLE,
      campaign_id: nil
    )
    new_user_membership = Membership.find_by(
      user: User.find_by(email: 'unexising.atanov@gmail.com'),
      client: campaign.client,
      role: Membership::CLIENT_ASSESSOR_ROLE,
      campaign_id: nil
    )
    expect(existing_user_membership).to be_present
    expect(new_user_membership).to be_present
  end
end
