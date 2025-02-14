# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::ProjectDetailHandler do
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) { create(:user_assessment, subject: user, assessment: assessment, status: :completed) }

  let!(:field) { { 'assessment_id' => assessment.id, 'field_name' => 'project_id' } }
  let!(:field2) { { 'assessment_id' => assessment.id, 'field_name' => 'project_name' } }
  let!(:field3) { { 'assessment_id' => assessment.id, 'field_name' => 'test' } }

  it '.call' do
    expect(described_class.call!(field, campaign_user: campaign_user)).to eq(project.id)
    expect(described_class.call!(field2, campaign_user: campaign_user)).to eq(project.name)
    expect(described_class.call!(field3, campaign_user: campaign_user)).to eq(nil)
  end
end
