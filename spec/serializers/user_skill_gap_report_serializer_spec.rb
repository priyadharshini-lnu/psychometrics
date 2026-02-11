# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserSkillGapReportSerializer do
  let(:client) { create(:project) }
  let(:campaign) { create(:campaign, project_id: client.id) }
  let(:user) { create(:user) }
  let(:report) { create(:report) }
  let(:user_report) { create(:user_report, user: user, campaign: campaign, report: report) }
  let(:ai_assistant) { create(:assistant) }
  let(:campaign_ai_artifact) do
    create(:campaign_ai_artifact, campaign: campaign, ai_assistant: ai_assistant, code: 'test_artifact')
  end

  describe '#campaign_ai_artifact_results' do
    context 'when user has no artifact results' do
      it 'returns empty array for campaign_ai_artifact_results' do
        result = described_class.new(context: {}).serialize(user_report)

        expect(result['campaign_ai_artifact_results']).to eq([])
      end
    end

    context 'when user has artifact results' do
      let(:another_artifact) do
        create(:campaign_ai_artifact, campaign: campaign, code: 'second_artifact')
      end

      let!(:first_result) do
        create(:campaign_ai_artifact_result,
               user: user,
               campaign_ai_artifact: campaign_ai_artifact)
      end

      let!(:second_result) do
        create(:campaign_ai_artifact_result,
               user: user,
               campaign_ai_artifact: another_artifact)
      end

      it 'includes all artifact results for the user' do
        result = described_class.new(context: {}).serialize(user_report)

        expect(result['campaign_ai_artifact_results'].length).to eq(2)
        codes = result['campaign_ai_artifact_results'].pluck('code')
        expect(codes).to contain_exactly('test_artifact', 'second_artifact')
      end
    end
  end
end
