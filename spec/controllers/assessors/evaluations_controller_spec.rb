# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessors::EvaluationsController, type: :controller do
  let(:current_user) { create(:user, :assessor) }
  let(:assessors_campaign) { current_user.assessors.first.campaign }
  let(:subject_user) { create(:user) }
  let!(:assessor_evaluation) do
    create(:user_assessment, evaluator: current_user, campaign: assessors_campaign, subject: subject_user)
  end
  let!(:subject_self_assessment) do
    create(:user_assessment, evaluator: subject_user, campaign: assessors_campaign, subject: subject_user)
  end

  before { login_user(current_user) }

  after { sign_out(current_user) }

  describe 'GET #subject_assessment' do
    it 'serves the assessment of a subject the assessor is assigned to evaluate' do
      get :subject_assessment, params: { evaluation_id: subject_self_assessment.id }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to have_key('result')
      expect(response.parsed_body.dig('assessment', 'id')).to eq(subject_self_assessment.assessment_id)
    end

    it 'refuses an assessment belonging to a subject the assessor does not evaluate' do
      other_assessment = create(:user_assessment)

      expect { get :subject_assessment, params: { evaluation_id: other_assessment.id } }.
        to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'refuses an assessment of another subject inside the same campaign' do
      stranger = create(:user)
      stranger_assessment = create(:user_assessment, evaluator: stranger, campaign: assessors_campaign,
                                                     subject: stranger)

      expect { get :subject_assessment, params: { evaluation_id: stranger_assessment.id } }.
        to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
