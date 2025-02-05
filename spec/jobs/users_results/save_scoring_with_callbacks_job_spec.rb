# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResults::SaveScoringWithCallbacksJob, type: :job do
  let(:user_result) { create(:users_result, answers: {}) }
  let(:current_user) { create(:user) }

  before do
    allow_any_instance_of(UserAssessment).to receive(:publish_assessment_assigned_webhook)
  end

  context 'when when assessment is agile' do
    before do
      allow(::UsersResults::CalculateAgileScoring).to receive(:call!).and_return({})
      allow(::UsersResults::GenerateReports).to receive(:call!)
      allow(UserAssessments::Webhook).to receive(:new).and_return(double(publish_assessment_completed: true,
                                                                         publish_results_available: true))
    end

    it 'processes the user result correctly' do
      allow(user_result).to receive(:completed?).and_return(true)
      allow(user_result.user_assessment).to receive(:update!)
      allow(user_result.assessment).to receive(:agile?).and_return(true)

      described_class.perform_now(user_result, current_user)

      expect(::UsersResults::CalculateAgileScoring).to have_received(:call!).with(user_result)

      expect(user_result.user_assessment).to have_received(:update!).with(score_calculated: true,
                                                                          score_calculated_at: Time.zone.now)
      expect(::UsersResults::GenerateReports).to have_received(:call!).with(user_result, current_user)
      expect(UserAssessments::Webhook).to have_received(:new).with(user_result.user_assessment)
      expect(UserAssessments::Webhook.new(user_result.user_assessment)).to have_received(:publish_assessment_completed)
      expect(UserAssessments::Webhook.new(user_result.user_assessment)).to have_received(:publish_results_available)
    end
  end

  context 'when assessment is non agile' do
    before do
      allow(::UsersResults::ExpandAnswersByRecoding).to receive(:call!).and_return({})
      allow(::UsersResults::CalculateScoring).to receive(:call!).and_return({})
      allow(::UsersResults::CalculateOccupations).to receive(:call!).and_return([])
      allow(::UsersResults::CalculateInnovationStyles).to receive(:call!).and_return([])
      allow(::UsersResults::GenerateReports).to receive(:call!)
      allow(UserAssessments::Webhook).to receive(:new).and_return(double(publish_assessment_completed: true,
                                                                         publish_results_available: true))
    end

    it 'processes the user result correctly' do
      allow(user_result).to receive(:completed?).and_return(true)
      allow(user_result.user_assessment).to receive(:update!)

      described_class.perform_now(user_result, current_user)

      expect(::UsersResults::ExpandAnswersByRecoding).to have_received(:call!).with(user_result)
      expect(::UsersResults::CalculateScoring).to have_received(:call!).with(user_result)
      expect(::UsersResults::CalculateOccupations).to have_received(:call!).with(user_result)
      expect(::UsersResults::CalculateInnovationStyles).to have_received(:call!).with(user_result)

      expect(user_result.user_assessment).to have_received(:update!).with(score_calculated: true,
                                                                          score_calculated_at: Time.zone.now)
      expect(::UsersResults::GenerateReports).to have_received(:call!).with(user_result, current_user)
      expect(UserAssessments::Webhook).to have_received(:new).with(user_result.user_assessment)
      expect(UserAssessments::Webhook.new(user_result.user_assessment)).to have_received(:publish_assessment_completed)
      expect(UserAssessments::Webhook.new(user_result.user_assessment)).to have_received(:publish_results_available)
    end

    context 'when user_result is not completed' do
      it 'does not process the user result' do
        allow(user_result).to receive(:completed?).and_return(false)

        described_class.perform_now(user_result, current_user)

        expect(::UsersResults::ExpandAnswersByRecoding).not_to have_received(:call!)
        expect(::UsersResults::CalculateScoring).not_to have_received(:call!)
        expect(::UsersResults::CalculateOccupations).not_to have_received(:call!)
        expect(::UsersResults::CalculateInnovationStyles).not_to have_received(:call!)

        expect(::UsersResults::GenerateReports).not_to have_received(:call!)
        expect(UserAssessments::Webhook).not_to have_received(:new)
      end
    end
  end
end
