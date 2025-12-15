# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::EvaluatorSerializer do
  describe '#to_hash' do
    let(:campaign) { create(:campaign) }
    let(:current_user) { create(:superadmin) }
    let(:dustin) { create(:user, email: 'dustin@poirier.com') }
    let!(:subject) do
      create(:threesixty_subject, user: dustin, campaign: campaign)
    end
    let!(:evaluator_with_subject) do
      evaluator = create(:threesixty_evaluator, user: dustin, campaign: campaign)
      Threesixty::Evaluator.eager_load(:self_subject).find(evaluator.id)
    end
    let!(:option) do
      create(:threesixty_option,
             reports: { 'access' => { 'self_can_access' => true },
                        'approval' => { 'manager_approves_reports' => true } })
    end
    let!(:evaluator) do
      evaluator = create(:threesixty_evaluator, user: create(:user), campaign: campaign)
      Threesixty::Evaluator.eager_load(:self_subject).find(evaluator.id)
    end
    let(:counters) do
      {
        evaluator_with_subject.user_id => { total_evaluators: 5,
                                            total_evaluations: 5, completed_evaluations: 3, completed_evaluators: 4 },
        evaluator.user_id => { total_evaluators: 0, total_evaluations: 5,
                               completed_evaluations: 3, completed_evaluators: 0 }
      }
    end

    before do
      allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true)
    end

    it do
      result = described_class.new(
        context: {
          counters: counters, option: option, current_user: current_user,
          subject_evaluator_counters: {
            evaluator_with_subject.user_id => {
              all: { 1 => 2, 2 => 2, 3 => 1 },
              completed: { 1 => 2, 2 => 1, 3 => 1 }
            }
          }
        }
      ).serialize(evaluator_with_subject).deep_symbolize_keys

      expect(result[:is_subject]).to eq true
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
      expect(result[:evaluators]).to eq '4 / 5'
      expect(result[:evaluations]).to eq '3 / 5'
      expect(result[:status]).to eq Threesixty::Participants::GetStatus::NOT_COMPLETED
      expect(result[:report_status]).to eq Threesixty::Participants::GetReportStatus::INCOMPLETE
    end

    it do
      result = described_class.new(
        context: {
          counters: counters, option: option, current_user: current_user
        }
      ).serialize(evaluator).deep_symbolize_keys

      expect(result[:is_subject]).to eq false
      expect(result[:evaluators]).to eq nil
      expect(result[:evaluations]).to eq '3 / 5'
    end
  end
end
