# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::IihtUserAssessmentsController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, iiht_user_assessment: build(:iiht_user_assessment))
  end
  let(:campaign) { user_assessment.campaign }

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET pass' do
    it 'redirects to campaign_path if user_assessment is completed' do
      user_assessment.completed!
      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(assessment_completed_path(campaign))
    end

    it "doesn't create IIHT assessment url if already created" do
      url = 'https://tte-iiht.com'
      user_assessment.iiht_user_assessment.update(url: url)
      expect(Iiht::AddAssessment).to_not receive(:call!)

      get :pass, params: { id: user_assessment.id }

      expect(response).to redirect_to(url)
    end

    it 'adds IIHT assessment if assessment url is not present and marks user_assessment in progress' do
      url = Faker::Internet.url
      config = { 'base_api_url' => 'https://tte-iiht.com' }
      allow_any_instance_of(Iiht::AddAssessment).to receive(:config).and_return(config)
      allow(Iiht::GetAuthToken).to receive(:call!)
      stub_request(:get, "#{config['base_api_url']}/testAndLearnerSpecificUrl").
        with(query: {
          email: user.email,
          learnerfirstName: user.first_name,
          learnerLastName: user.last_name,
          testName: user_assessment.assessment.iiht_assessment_name,
          companyId: config['company_id']
        }).
        to_return({ body: { 'data' => url }.to_json })

      get :pass, params: { id: user_assessment.id }

      expect(user_assessment.reload.in_progress?).to eq(true)
      expect(user_assessment.iiht_user_assessment.url).to redirect_to(url)
    end
  end
end
