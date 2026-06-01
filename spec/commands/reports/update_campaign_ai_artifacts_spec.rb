# frozen_string_literal: true

require 'rails_helper'

describe Reports::UpdateCampaignAIArtifacts do
  describe '#call' do
    let!(:report) { create(:report) }
    let!(:ai_assistant) { create(:assistant) }

    let!(:existing_artifacts) do
      [
        create(:report_campaign_ai_artifact, report: report, code: 'artifact1', name: 'Artifact 1',
          ai_assistant: ai_assistant),
        create(:report_campaign_ai_artifact, report: report, code: 'artifact2', name: 'Artifact 2',
          ai_assistant: ai_assistant)
      ]
    end

    before do
      existing_artifacts
    end

    context 'with valid parameters' do
      it 'updates existing artifacts and creates new ones' do
        new_assistant = create(:assistant)
        new_artifacts_params = [
          { 'code' => 'artifact1', 'name' => 'Updated Artifact 1', 'ai_assistant' => { 'id' => ai_assistant.id.to_s } },
          { 'code' => 'artifact3', 'name' => 'New Artifact 3', 'ai_assistant' => { 'id' => new_assistant.id.to_s } }
        ]

        described_class.call(report, new_artifacts_params)

        expect(report.reload.campaign_ai_artifacts.count).to eq(new_artifacts_params.length)

        updated_artifact = report.campaign_ai_artifacts.find_by(code: 'artifact1')
        new_artifact = report.campaign_ai_artifacts.find_by(code: 'artifact3')

        expect(report.campaign_ai_artifacts.find_by(code: 'artifact2')).to be_nil
        expect(updated_artifact).to have_attributes(
          name: 'Updated Artifact 1',
          ai_assistant_id: ai_assistant.id
        )
        expect(new_artifact).to have_attributes(
          name: 'New Artifact 3',
          ai_assistant_id: new_assistant.id
        )
      end

      it 'sets tenant_id from the report on imported artifacts' do
        tenant = create(:tenancy)
        report.update_column(:tenant_id, tenant.id)
        new_artifacts_params = [
          { 'code' => 'artifact_new', 'name' => 'Tenanted Artifact',
            'ai_assistant' => { 'id' => ai_assistant.id.to_s } }
        ]

        described_class.call(report, new_artifacts_params)

        new_artifact = report.campaign_ai_artifacts.find_by(code: 'artifact_new')
        expect(new_artifact.tenant_id).to eq(tenant.id)
      end

      it 'removes all artifacts when empty array is provided' do
        described_class.call(report, [])

        expect(report.reload.campaign_ai_artifacts.count).to eq(0)
        expect(report.campaign_ai_artifacts.find_by(code: 'artifact1')).to be_nil
        expect(report.campaign_ai_artifacts.find_by(code: 'artifact2')).to be_nil
      end

      it 'updates campaign AI artifact codes in report modules' do
        new_artifacts_params = [
          { 'code' => 'artifact1', 'name' => 'Updated Artifact 1', 'ai_assistant' => { 'id' => ai_assistant.id.to_s } }
        ]

        props = { 'source' => { 'type' => 'CampaignAIArtifacts', 'codes' => %w[artifact1 artifact2] } }
        page = create(:page, report: report)
        create(:module, page: page, props: props)

        described_class.call(report, new_artifacts_params)

        report_module = report.modules.first
        expect(report_module.props['source']['codes']).to eq(['artifact1'])
      end
    end

    context 'with invalid parameters' do
      it 'raises error when params is not an array' do
        invalid_params = { 'some' => 'data' }

        expect do
          described_class.call(report, invalid_params)
        end.to raise_error(described_class::InvalidArtifactParams)
      end

      it 'raises error when artifact params are missing required fields' do
        invalid_params = [{ 'code' => 'artifact1' }] # missing name and ai_assistant

        expect do
          described_class.call(report, invalid_params)
        end.to raise_error(described_class::InvalidArtifactParams)
      end

      it 'raises error when too many artifacts are provided' do
        large_params = (1..101).map do |i|
          { 'code' => "artifact#{i}", 'name' => "Artifact #{i}", 'ai_assistant' => { 'id' => ai_assistant.id.to_s } }
        end

        expect do
          described_class.call(report, large_params)
        end.to raise_error(described_class::TooManyCampaignAIArtifacts)
      end

      it 'raises error when ai_assistant_id does not exist' do
        invalid_ai_assistant_id = (AI::Assistant.maximum(:id) || 0) + 1000
        invalid_params = [
          { 'code' => 'artifact1', 'name' => 'Artifact 1', 'ai_assistant' => { 'id' => invalid_ai_assistant_id } }
        ]

        expect do
          described_class.call(report, invalid_params)
        end.to raise_error(Reports::UpdateCampaignAIArtifacts::InvalidArtifactParams)
      end
    end
  end
end
