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
      create(:assign, membership: membership, assessment: assessment)
    end

    it do
      args = {
        project: project,
        campaign: campaign,
        subject: nil,
        membership: user.memberships.join_user.find_by(client_id: project.id),
        report: assessment.reports.first,
        locale: 'en',
        current_user: user
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
    let(:users_report) do
      create(:users_report, report: threesixty_campaign.report,
                                campaign: threesixty_campaign.campaign, user_id: subject.user_id)
    end

    before do
      allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(true)
      create(:threesixty_participant, campaign: threesixty_campaign.campaign,
             subject: subject.user, evaluator: evaluator_1, relationship: manager)
      create(:threesixty_participant, campaign: threesixty_campaign.campaign,
             subject: subject.user, evaluator: evaluator_2, relationship: peer)
      create(:threesixty_participant, campaign: threesixty_campaign.campaign,
             evaluator: evaluator_3, relationship: customer)
      create_users_result(threesixty_campaign, subject, evaluator_1)
      create_users_result(threesixty_campaign, subject, evaluator_2)
      create_users_result(threesixty_campaign, subject, evaluator_3)
    end

    it do
      args = {
        project: project,
        subject: subject,
        report: threesixty_campaign.report,
        users_report: users_report,
        current_user: evaluator_1
      }
      results = described_class.new(args).serialize_results
      expect(results[threesixty_campaign.assessment.id].
        map { |r| r[:relationship] }).to match_array %w[manager peer]
    end
  end

  def create_users_result(threesixty_campaign, subject, evaluator)
    create(:users_result,
           campaign: threesixty_campaign.campaign,
           status: 'completed',
           assessment: threesixty_campaign.assessment,
           subject: subject.user,
           evaluator: evaluator)
  end
end
