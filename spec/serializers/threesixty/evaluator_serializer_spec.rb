# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::EvaluatorSerializer do
  describe '#to_hash' do
    let(:campaign) { create(:campaign) }
    let(:dustin) { create(:user, email: 'dustin@poirier.com') }
    let!(:subject) do
      create(:threesixty_subject, user: dustin, campaign: campaign, completed_evaluators_count: 4, evaluators_count: 5)
    end
    let!(:evaluator_with_subject) do
      create(:threesixty_evaluator, user: dustin, campaign: campaign, completed_evaluations_count: 3, evaluations_count: 5)
    end
    let!(:option) do
      create(:threesixty_option,
        participants: { "manager" =>  { "can_approves_evaluations" => true } },
        reports: { "access" =>  { "self_can_access" => true } }
      )
    end
    let!(:evaluator) do
      create(:threesixty_evaluator, user: create(:user), campaign: campaign, completed_evaluations_count: 3, evaluations_count: 5)
    end
    let(:counters) do
      {
        evaluator_with_subject.user_id => { total_evaluators: 5, total_evaluations: 5, completed_evaluations: 3, completed_evaluators: 4 },
        evaluator.user_id => { total_evaluators: 0, total_evaluations: 5, completed_evaluations: 3, completed_evaluators: 0 }
      }
    end

    before do
      allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true)
    end


    it do
      result = described_class.new(evaluator_with_subject, counters: counters, option: option).to_hash
      expect(result[:is_subject]).to eq true
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
      expect(result[:evaluators]).to eq '4 / 5'
      expect(result[:evaluations]).to eq '3 / 5'
      expect(result[:status]).to eq 'not_completed'
      expect(result[:report_status]).to eq 'incomplete'
    end

    it do
      result = described_class.new(evaluator, counters: counters, option: option).to_hash
      expect(result[:is_subject]).to eq false
      expect(result[:evaluators]).to eq nil
      expect(result[:evaluations]).to eq '3 / 5'
    end
  end
end
