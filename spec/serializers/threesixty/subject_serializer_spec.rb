# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::SubjectSerializer do
  describe 'subject is also evaluator' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) { create(:threesixty_option, participants: {requires_approval: true})}
    let(:subject) do
      create(:threesixty_subject, user: user, campaign: campaign, completed_evaluators_count: 4, evaluators_count: 5)
    end
    let!(:evaluator) do
      create(:threesixty_evaluator, user: user, campaign: campaign, completed_evaluations_count: 3, evaluations_count: 5)
    end
    before do
      allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true)
    end

    it do
      result = described_class.new(subject, option: option).to_hash
      expect(result[:evaluators]).to eq '4 / 5'
      expect(result[:report_status]).to eq 'incomplete'
      expect(result[:evaluations]).to eq '3 / 5'
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end
  describe 'subject is not evaluator' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) { create(:threesixty_option, participants: { requires_approval: true }) }
    let(:subject) do
      create(:threesixty_subject, user: user, campaign: campaign, completed_evaluators_count: 4, evaluators_count: 5, report_approval_status: 2)
    end

    it do
      result = described_class.new(subject, option: option).to_hash
      expect(result[:evaluators]).to eq '4 / 5'
      expect(result[:report_status]).to eq 'denied'
      expect(result[:evaluations]).to eq '0 / 0'
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end
end
