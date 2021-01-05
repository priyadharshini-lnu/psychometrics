# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::AssessorsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:campaign) { create(:campaign) }
  let!(:assessment1) { create(:assessment, category: :assessor_form, name: 'A 1') }
  let!(:assessment2) { create(:assessment, category: :assessor_form, name: 'A 2') }
  let(:user) { create(:user) }
  let!(:subject) do
    user = create(:user, project: campaign.project, email: 'fedor@gmail.com')
    create(:campaign_user, user: user, campaign: campaign)
    user
  end

  before(:each) { login_user(current_user) }
  before(:each) { create(:relationship, name: Relationship::ASSESSOR, type: :global) }
  after(:each) { sign_out(current_user) }

  it '[GET] available_assessments' do
    get :available_assessments, params: {
      new_campaign_id: campaign.id
    }, as: :json

    parsed_response = JSON.parse(response.body)

    expect(parsed_response).to eq(
      [{ 'id' => assessment1.id, 'name' => 'A 1' }, { 'id' => assessment2.id, 'name' => 'A 2' }]
    )
  end

  it '[POST] create_all' do
    post :create_all, params: {
      new_campaign_id: campaign.id,
      assessors: [
        {
          assessor_email: 'existing.atanov@gmail.com',
          assessor_first_name: 'Vlad',
          assessor_last_name: 'Ata',
          subject_email: 'fedor@gmail.com',
          assessment_ids: [assessment1.id]
        }
      ]
    }
    parsed_response = JSON.parse(response.body)

    expect(parsed_response).to eq('ok')
  end
end
