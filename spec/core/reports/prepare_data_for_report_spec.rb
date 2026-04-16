# frozen_string_literal: true

require 'rails_helper'

describe Reports::PrepareDataForReport do
  let!(:assessment) { create(:assessment, :with_report, name: 'first assessment') }
  let(:project) { create(:project) }

  describe '#call' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }
    let(:artifact) { create(:campaign_ai_artifact, campaign: threesixty_campaign.campaign) }
    let(:user_report) do
      create(:user_report, report: threesixty_campaign.report,
                           campaign: threesixty_campaign.campaign, user_id: subject.user_id)
    end
    let(:args) do
      {
        project: project,
        user_report: user_report,
        current_user: subject.user
      }
    end

    before do
      allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(false)
      allow(Reports::GetTranslationWithPipetextReplaced).to receive(:call!).and_return({})
    end

    it 'includes artifact results for the user in the broadcast' do
      create(:campaign_ai_artifact_result, campaign_ai_artifact: artifact, user: subject.user)

      result = described_class.call!(args)

      expect(JSON.parse(result[:campaign_ai_artifact_results])).not_to be_empty
    end

    it 'handles empty campaign_ai_artifact_results when none exist' do
      result = described_class.call!(args)

      expect(JSON.parse(result[:campaign_ai_artifact_results])).to be_empty
    end
  end

  describe '#lookup_results' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }
    let(:manager) { create(:relationship, name: 'manager') }
    let(:peer) { create(:relationship, name: 'peer') }
    let(:customer) { create(:relationship, name: 'customer') }
    let(:first_evaluator) { create(:user) }
    let(:second_evaluator) { create(:user) }
    let(:third_evaluator) { create(:user) }
    let(:user_report) do
      create(:user_report, report: threesixty_campaign.report,
                                campaign: threesixty_campaign.campaign, user_id: subject.user_id)
    end

    before do
      allow_any_instance_of(Report).to receive(:category_threesixty?).and_return(true)
      create_users_result(threesixty_campaign, subject, first_evaluator, manager)
      create_users_result(threesixty_campaign, subject, second_evaluator, peer)
    end

    it do
      args = {
        project: project,
        subject: subject,
        report: threesixty_campaign.report,
        user_report: user_report,
        current_user: first_evaluator
      }
      results = described_class.new(args).serialize_results
      expect(results[threesixty_campaign.assessment.id].pluck('relationship')).to match_array %w[manager peer]
    end
  end

  def create_users_result(threesixty_campaign, subject, evaluator, relationship)
    create(:users_result,
           campaign: threesixty_campaign.campaign,
           status: 'completed',
           assessment: threesixty_campaign.assessment,
           subject: subject.user,
           evaluator: evaluator,
          relationship: relationship,
          score_calculated: true)
  end
end
