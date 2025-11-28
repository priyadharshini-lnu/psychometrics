# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::CampaignArtifact, type: :model do
  subject(:campaign_artifact) { create(:campaign_ai_artifact, ai_assistant: assistant) }

  let(:assistant) { create(:assistant) }

  describe '#validate_results_schema' do
    let!(:schema_key_summary) do
      create(:assistant_output_schema_key, ai_assistant: assistant, key: 'summary', key_type: 'string')
    end
    let!(:schema_key_feedback) do
      create(:assistant_output_schema_key, ai_assistant: assistant, key: 'feedback', key_type: 'string')
    end

    context 'when results are valid' do
      let(:valid_results) do
        {
          'summary' => 'This is a test summary',
          'feedback' => 'Good performance'
        }
      end

      it 'returns empty errors array' do
        errors = campaign_artifact.validate_results_schema(valid_results)
        expect(errors).to be_empty
      end
    end

    context 'when results have missing keys' do
      let(:incomplete_results) do
        {
          'summary' => 'This is a test summary'
          # missing 'feedback' key
        }
      end

      it 'returns error for missing keys' do
        errors = campaign_artifact.validate_results_schema(incomplete_results)
        expect(errors).to include("is missing required keys: 'feedback'")
      end
    end

    context 'when results have multiple missing keys' do
      let(:incomplete_results) { {} }

      it 'returns error for all missing keys' do
        errors = campaign_artifact.validate_results_schema(incomplete_results)
        expect(errors).to include("is missing required keys: 'summary', 'feedback'")
      end
    end

    context 'when results have extra keys' do
      let(:results_with_extra_keys) do
        {
          'summary' => 'This is a test summary',
          'feedback' => 'Good performance',
          'extra_field' => 'This should not be here'
        }
      end

      it 'returns error for extra keys' do
        errors = campaign_artifact.validate_results_schema(results_with_extra_keys)
        expect(errors).to include("contains unexpected keys: 'extra_field'")
      end
    end

    context 'when results have multiple extra keys' do
      let(:results_with_multiple_extra_keys) do
        {
          'summary' => 'This is a test summary',
          'feedback' => 'Good performance',
          'extra_field_1' => 'This should not be here',
          'extra_field_2' => 'Neither should this'
        }
      end

      it 'returns error for all extra keys' do
        errors = campaign_artifact.validate_results_schema(results_with_multiple_extra_keys)
        expect(errors).to include("contains unexpected keys: 'extra_field_1', 'extra_field_2'")
      end
    end

    context 'when results have both missing and extra keys' do
      let(:invalid_results) do
        {
          'summary' => 'This is a test summary',
          'extra_field' => 'This should not be here'
          # missing 'feedback' key
        }
      end

      it 'returns errors for both missing and extra keys' do
        errors = campaign_artifact.validate_results_schema(invalid_results)
        expect(errors).to include("is missing required keys: 'feedback'")
        expect(errors).to include("contains unexpected keys: 'extra_field'")
      end
    end

    context 'when results have wrong data types' do
      let(:results_with_wrong_types) do
        {
          'summary' => 123, # should be string
          'feedback' => 'Good performance'
        }
      end

      it 'returns error for wrong data types' do
        errors = campaign_artifact.validate_results_schema(results_with_wrong_types)
        expect(errors).to include('summary should be a string')
      end
    end

    context 'when results is nil' do
      it 'returns errors for all missing keys' do
        errors = campaign_artifact.validate_results_schema(nil)
        expect(errors).to include("is missing required keys: 'summary', 'feedback'")
      end
    end

    context 'when assistant has no schema keys' do
      let(:assistant_without_schema) { create(:assistant) }
      let(:campaign_artifact_without_schema) do
        create(:campaign_ai_artifact, ai_assistant: assistant_without_schema)
      end

      it 'returns error for unexpected keys when results are provided' do
        results = { 'any_key' => 'any_value' }
        errors = campaign_artifact_without_schema.validate_results_schema(results)
        expect(errors).to include("contains unexpected keys: 'any_key'")
      end

      it 'returns no errors when results are empty' do
        errors = campaign_artifact_without_schema.validate_results_schema({})
        expect(errors).to be_empty
      end
    end
  end

  describe 'dependent destroy' do
    context 'when artifact is destroyed' do
      let(:campaign) { create(:campaign) }
      let(:campaign_artifact) { create(:campaign_ai_artifact, campaign: campaign) }

      let!(:campaign_factor) { create(:campaign_factor, campaign: campaign) }
      let!(:question) { create(:question) }
      let!(:datasheet) { create(:datasheet, campaign: campaign) }
      let!(:sheet_column) { create(:sheet_column, sheet: datasheet) }

      before do
        campaign_artifact.dependencies.create!(dependency: campaign_factor)
        campaign_artifact.dependencies.create!(dependency: question)
        campaign_artifact.dependencies.create!(dependency: sheet_column)
      end

      it 'destroys all associated dependencies' do
        dependency_ids = campaign_artifact.dependencies.pluck(:id)

        expect(AI::CampaignArtifactDependency.where(id: dependency_ids).count).to eq(3)

        campaign_artifact.destroy!

        expect(AI::CampaignArtifactDependency.where(id: dependency_ids).count).to eq(0)
      end

      it 'destroys all associated artifact results' do
        user1 = create(:user)
        user2 = create(:user)

        # Create artifact results for the campaign artifact
        artifact_result1 = create(:campaign_ai_artifact_result, campaign_ai_artifact: campaign_artifact, user: user1)
        artifact_result2 = create(:campaign_ai_artifact_result, campaign_ai_artifact: campaign_artifact, user: user2)

        result_ids = [artifact_result1.id, artifact_result2.id]

        expect(AI::CampaignArtifactResult.where(id: result_ids).count).to eq(2)

        campaign_artifact.destroy!

        expect(AI::CampaignArtifactResult.where(id: result_ids).count).to eq(0)
      end
    end
  end
end
