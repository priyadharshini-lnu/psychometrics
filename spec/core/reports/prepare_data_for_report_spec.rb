# frozen_string_literal: true

require 'rails_helper'

describe Reports::PrepareDataForReport do
  let!(:assessment) { create(:assessment, :with_report, name: 'first assessment') }
  let(:project) { create(:project) }

  describe '.call' do
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
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }
    let(:manager) { create(:relationship, name: 'manager') }
    let(:peer) { create(:relationship, name: 'peer') }
    let(:customer) { create(:relationship, name: 'customer') }
    let(:evaluator_1) { create(:user) }
    let(:evaluator_2) { create(:user) }
    let(:evaluator_3) { create(:user) }
    let(:users_report) { create(:users_report, report: threesixty_campaign.report, campaign: threesixty_campaign.campaign, user_id: subject.user_id) }

    before do
      allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(true)
      create(:participant, subject: subject.user, evaluator: evaluator_1, relationship: manager)
      create(:participant, subject: subject.user, evaluator: evaluator_2, relationship: peer)
      create(:participant, evaluator: evaluator_3, relationship: customer)
      create(:users_result, status: 'completed', assessment: threesixty_campaign.assessment, subject: subject.user, evaluator: evaluator_1)
      create(:users_result, status: 'completed', assessment: threesixty_campaign.assessment, subject: subject.user, evaluator: evaluator_2)
      create(:users_result, status: 'completed', assessment: threesixty_campaign.assessment, subject: subject.user, evaluator: evaluator_3)
    end

    it do
      args = {
        project: project,
        subject: subject,
        report: threesixty_campaign.report,
        users_report: users_report
      }
      results = described_class.new(args).serialize_results
      expect(results[threesixty_campaign.assessment.id].map{|r| r[:relationship]}).to match_array %w[manager peer]
    end
  end
end
