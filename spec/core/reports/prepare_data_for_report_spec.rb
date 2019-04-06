# frozen_string_literal: true

require 'rails_helper'

describe Reports::PrepareDataForReport do
  let!(:assessment) { create(:assessment, :with_report, name: 'first assessment') }

  describe '.call' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign) }
    let(:user) { create(:user, email: 'a@a.com') }
    let!(:membership) { create(:membership, user: user, client: project) }
    before do
      allow_any_instance_of(Assign).to receive(:relevant_assessment).and_return(true)
      create(:assign, membership: membership, assessment: assessment)
    end

    it do
      args = {
        project: project,
        campaign: campaign,
        subject: nil,
        membership: user.memberships.join_user.find_by(client_id: project.id),
        report: assessment.reports.first,
        locale: 'en'
      }

      data = described_class.call!(args)
      expect(JSON.parse(data[:user])['email']).to eq 'a@a.com'
      expect(JSON.parse(data[:data])['assessments'].last['name']).to eq 'first assessment'
      expect(data[:locales]).to eq '{}'
      expect(data[:results]).to eq '{}'
      expect(data[:available_translations]).to eq []
    end
  end

  describe '#lookup_results' do
    let(:subject) { create(:threesixty_subject) }
    let(:manager) { create(:relationship, name: 'manager') }
    let(:peer) { create(:relationship, name: 'peer') }
    let(:customer) { create(:relationship, name: 'customer') }
    let(:evaluator_1) { create(:campaigns_user) }
    let(:evaluator_2) { create(:campaigns_user) }
    let(:evaluator_3) { create(:campaigns_user) }

    before do
      allow_any_instance_of(Report).to receive(:threesixty?).and_return(true)
      create(:participant, subject: subject.campaigns_user, evaluator: evaluator_1, relationship: manager)
      create(:participant, subject: subject.campaigns_user, evaluator: evaluator_2, relationship: peer)
      create(:participant, evaluator: evaluator_3, relationship: customer)
      create(:assign, evaluator: evaluator_1, status: :completed)
      create(:assign, evaluator: evaluator_2, status: :completed)
      create(:assign, evaluator: evaluator_3, status: :completed)
    end

    it do
      args = {
        subject: subject,
        report: assessment.reports.first
      }
      results = described_class.new(args).lookup_results
      expect(results.map(&:relationship)).to match_array %w[manager peer]
    end
  end
end
