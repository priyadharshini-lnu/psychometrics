# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::IihtUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, subject: user, iiht_user_assessment: build(:iiht_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pass' do
    it 'redirects to campaign_path if user_assessment is completed' do
      user_assessment.completed!
      allow(user.user_profile).to receive(:photo) { 'test' }

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
    end

    it "doesn't create IIHT assessment url if already created" do
      url = 'https://tte-iiht.com'
      user_assessment.iiht_user_assessment.update(url: url)
      expect(Iiht::AddAssessment).to_not receive(:call!)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(url)
    end

    it 'adds IIHT assessment if assessment url is not present and marks user_assessment in progress' do
      schedule_link = Faker::Internet.url
      schedule_id = 123
      config = { 'tenant_id' => '123' }
      allow_any_instance_of(Iiht::AddAssessment).to receive(:config).and_return(config)
      allow(Iiht::AllowAttempts).to receive(:call!)
      allow(Iiht::GetAuthToken).to receive(:call!)
      stub_request(:post, "#{Settings.iiht.base_api_url}/GetAssessmentURLAsync").
        to_return({
          body: {
            'result' => { 'isSuccess' => true, 'scheduleLink' => schedule_link, 'scheduleId' => schedule_id }
          }.to_json
        })

      get :pass, params: { id: user_assessment.id }

      expect(user_assessment.reload.in_progress?).to eq(true)
      expect(user_assessment.iiht_user_assessment.schedule_id).to eq(schedule_id)
      expect(user_assessment.iiht_user_assessment.url).to redirect_to(schedule_link)
      expect(response).to redirect_to(schedule_link)
    end
  end

  describe 'GET redirect' do
    it 'calls Iiht::SaveScoresJob, marks user_assessment as completed and redirects to assessment complete path' do
      expect(::Iiht::SaveScoresJob).to receive(:perform_later).with(user_assessment)
      get :redirect, params: { campaign_id: campaign.id, assessment_id: user_assessment.assessment_id }

      expect(user_assessment.reload.completed?).to eq(true)
      expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
    end
  end
end
