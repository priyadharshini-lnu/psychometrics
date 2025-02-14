# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::UserAssessmentDetailHandler do
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_assessment) do
    create(:user_assessment, subject: user, assessment: assessment, status: :completed,
           completed_at: Time.current)
  end

  let!(:field) { { 'assessment_id' => assessment.id, 'field_name' => 'status' } }
  let!(:field2) { { 'assessment_id' => assessment.id, 'field_name' => 'completed_at', 'date_format' => '%d-%b-%Y' } }
  let!(:field3) { { 'assessment_id' => assessment.id, 'field_name' => 'test' } }

  it '.call' do
    context = {}
    expect(described_class.call!(field, campaign_user: campaign_user, ctx: context)).to eq('completed')
    expect(described_class.call!(field2, campaign_user: campaign_user, ctx: context)).to eq('15-Sep-2018')
    expect(described_class.call!(field3, campaign_user: campaign_user, ctx: context)).to eq(nil)
  end
end
