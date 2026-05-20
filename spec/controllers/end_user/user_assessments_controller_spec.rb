# frozen_string_literal: true

require 'rails_helper'

describe EndUser::UserAssessmentsController, type: :controller do
  let(:campaign) { create(:campaign, status: :active) }
  let(:project) { campaign.project }
  let(:assessment) { create(:assessment) }

  let!(:campaign_assessment) do
    create(:campaign_assessment, campaign: campaign, assessment: assessment,
            assessment_key: SecureRandom.urlsafe_base64(16), enable_universal_links: true)
  end

  before do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    allow_any_instance_of(BrowserDetector).to receive(:supported_browser?).and_return(true)
  end

  describe 'GET #assessment' do
    context 'When user is anonymous user' do
      before do
        user = Users::CreateAnonymCampaignUser.call!(campaign_assessment)
        allow(Users::AuthenticateAnonymousUser).to receive(:call!).and_return(user)
      end

      it 'returns a success response' do
        get :assessment, params: { format: :json, id: campaign_assessment.user_assessments.last.id }

        expect(response).to have_http_status(:success)
      end

      it 'returns success response even if profile is incomplete' do
        allow(Users::ProfileCompletion).to receive(:call!).and_return(50)

        get :assessment, params: { format: :json, id: campaign_assessment.user_assessments.last.id }

        expect(response).to have_http_status(:success)
      end
    end

    context 'When user is regular user' do
      let(:user_assessment) { create(:user_assessment, assessment: assessment, campaign: campaign) }

      before do
        user = user_assessment.user
        create(:campaign_user, campaign: campaign, user: user, schedule_start_date: 1.day.ago,
          schedule_end_date: 1.day.from_now)
        login_user(user)
      end

      it 'returns a success response' do
        get :assessment, params: { format: :json, id: user_assessment.id }

        expect(response).to have_http_status(:success)
      end

      it 'redirects if profile is incomplete' do
        allow(Users::ProfileCompletion).to receive(:call!).and_return(50)

        get :assessment, params: { format: :json, id: user_assessment.id }

        expect(response).to have_http_status(:redirect)
      end
    end
  end

  describe 'GET #pass' do
    let(:user_assessment) { create(:user_assessment, assessment: assessment, campaign: campaign) }

    before do
      user = user_assessment.user
      user.update!(project: campaign.project)
      create(:campaign_user, campaign: campaign, user: user, schedule_start_date: 1.day.ago,
        schedule_end_date: 1.day.from_now)
      login_user(user)
      allow(GetProjectBySubdomain).to receive(:call!).and_return(campaign.project)
      allow(UserAssessments::CanStart).to receive(:call!).and_return(false)
      allow(UserAssessments::CanStartBasedOnSequencing).to receive(:call!).and_return(true)
      allow(UserAssessments::Pass).to receive(:call!)
      allow(Translation).
        to receive(:available_translation_for_assessment).
        and_return(%w[ar fr])
      allow(assessment).to receive(:default_language).and_return(:en)
      project.update(locales: %w[en ar fr])
    end

    it 'allows request when lang parameter is valid' do
      get :pass, params: { id: user_assessment.id, lang: 'ar' }

      expect(response).to have_http_status(:success)
      expect(response).not_to be_redirect
    end

    it 'redirects with default locale when lang parameter is invalid' do
      get :pass, params: { id: user_assessment.id, lang: 'invalid' }

      expect(response).to be_redirect
      expect(response.location).to include('lang=en')
    end
  end
end
