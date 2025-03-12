# frozen_string_literal: true

require 'rails_helper'

describe DataReports::FieldHandlers::UserDetailHandler do
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:assessment) { create(:assessment) }
  let!(:user) { create(:user, :with_project_membership, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:question) { create(:question, name: 'emirates_id') }
  let!(:profile_field_setting) do
    create(:profile_field, profile_setting: project.profile_setting, question: question)
  end
  let!(:profile_value) do
    create(:profile_field_value, profile_field: profile_field_setting, user_profile: user.user_profile,
            string_value: '12345')
  end

  let!(:field) { { 'field_name' => 'email' } }
  let!(:profile_field) { { 'field_name' => 'age' } }
  let!(:custom_field) { { 'field_name' => 'emirates_id' } }
  let!(:test_field) { { 'field_name' => 'test' } }

  it '.call' do
    project.profile_setting.questions << question
    user.user_profile.update(age: 33, custom_fields: { question.id => '12345' })
    context = {
      custom_fields: project.profile_setting.questions
    }

    expect(described_class.call!(field, campaign_user: campaign_user, ctx: context)).to eq(user.email)
    expect(described_class.call!(profile_field, campaign_user: campaign_user, ctx: context)).to eq(33)
    expect(described_class.call!(custom_field, campaign_user: campaign_user, ctx: context)).to eq('12345')
    expect(described_class.call!(test_field, campaign_user: campaign_user, ctx: context)).to eq(nil)
  end
end
