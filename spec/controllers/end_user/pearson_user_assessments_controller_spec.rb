# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::PearsonUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, pearson_user_assessment: build(:pearson_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pass' do
    it 'redirects to campaign_path if user_assessment is completed' do
      user_assessment.completed!
      expect(::Saville::AssessmentOrderRequest).to_not receive(:call!)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
    end

    it "doesn't create Pearson Schedule if already created" do
      url = 'https://tte-pearson.com'
      user_assessment.pearson_user_assessment.update(url: url)
      expect(::Pearson::CreateSchedule).to_not receive(:call!)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(url)
    end

    it 'create Pearson Schedule if assessment url is not present and marks user_assessment in progress' do
      config = Settings.secrets.pearson
      url = Faker::Internet.url
      allow(Pearson::GetAuthToken).to receive(:call!)
      allow_any_instance_of(UserAssessment).to receive(:pearson_assessment_language).and_return('en-Gb')
      stub_request(:post, "#{config[:base_api_url]}/v1/schedules").
        to_return({ body: { 'data' => { 'urls' => [{ 'url' => url }] } }.to_json })

      get :pass, params: { id: user_assessment.id }

      expect(user_assessment.reload.in_progress?).to eq(true)
      expect(user_assessment.pearson_user_assessment.url).to redirect_to(url)
    end
  end

  describe 'GET redirect' do
    it 'mark user_assessment as completed if saville assessment is completed and redirect to campaign' do
      allow(Pearson::GetScheduleStatus).to receive(:call!).and_return('Completed')
      get :redirect, params: { id: user_assessment.id }

      expect(user_assessment.reload.completed?).to eq(true)
      expect(response).to redirect_to(assessment_completed_path(campaign, user_assessment_id: user_assessment.id))
    end

    it "doesn't mark user_assessment as completed if saville assessment is not completed" do
      allow(Pearson::GetScheduleStatus).to receive(:call!).and_return('InProgress')
      get :redirect, params: { id: user_assessment.id }

      expect(user_assessment.reload.completed?).to eq(false)
    end
  end
end
