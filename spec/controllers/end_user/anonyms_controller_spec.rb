# frozen_string_literal: true

require 'rails_helper'

describe EndUser::AnonymsController, type: :controller do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:report_family) { report.report_families.first }
  let!(:license) do
    create(
      :license,
      report_family: report_family,
      client: campaign.client,
      start_date: 2.days.ago,
      end_date: 2.days.since
    )
  end

  let!(:campaign_report) do
    create(:campaign_report, campaign: campaign, report: report, report_family: report_family)
  end

  let!(:campaign_assessment) do
    create(:campaign_assessment, campaign: campaign, assessment: assessment,
            assessment_key: SecureRandom.urlsafe_base64(16), enable_universal_links: true)
  end

  before do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    allow_any_instance_of(BrowserDetector).to receive(:supported_browser?).and_return(true)
  end

  describe 'GET #show' do
    context 'when assessment key is valid' do
      it 'returns assessment details' do
        get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key }

        expect(response).to have_http_status(:success)
        expect(response.parsed_body).to include('assessment')
      end

      context 'when lang parameter is provided' do
        before do
          user = Users::CreateAnonymCampaignUser.call!(campaign_assessment)
          allow(Users::AuthenticateAnonymousUser).to receive(:call!).and_return(user)
          project.update(locales: %w[en ar])
        end

        it 'updates the selected locale for the user assessment' do
          get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key, lang: 'ar' }

          user_assessment = campaign_assessment.user_assessments.last

          expect(user_assessment.selected_locale).to eq('ar')
        end

        it 'sets the locale cookie and updates the user locale if the locale is available' do
          get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key, lang: 'ar' }

          expect(cookies[:locale]).to eq('ar')
          expect(User.last.user_profile.locale).to eq('ar')
        end

        it 'does not set the locale cookie or update the user locale if the locale is not available' do
          get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key, lang: 'de' }

          expect(cookies[:locale]).to be_nil
          expect(User.last.reload.user_profile.locale).not_to eq('de')
        end
      end
    end

    context 'when assessment key is invalid' do
      it 'returns not found status' do
        get :show, params: { format: :json, assessment_key: 'invalid_key' }

        expect(response).to redirect_to(action: 'error')
      end
    end

    context 'when assessment is archived' do
      before do
        assessment.update(archived: true)
      end

      it 'redirects to error action' do
        get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key }

        expect(response).to redirect_to(action: 'error')
      end
    end

    context 'when universal links are not enabled' do
      before do
        campaign_assessment.update(enable_universal_links: false)
      end

      it 'redirects to error action' do
        get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key }

        expect(response).to redirect_to(action: 'error')
      end
    end

    context 'when there are not enough licenses' do
      before do
        allow_any_instance_of(Users::CreateAnonymCampaignUser).to receive(:ensure_sufficient_licenses).
          and_raise(Licenses::NotEnoughError)
      end

      it 'redirects to error action' do
        get :show, params: { format: :json, assessment_key: campaign_assessment.assessment_key }

        expect(response).to redirect_to(action: 'error')
      end
    end
  end
end
