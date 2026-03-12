# frozen_string_literal: true

require 'rails_helper'

describe AI::Tools::CampaignArtifactResultManager do
  subject do
    described_class.new(
      artifact, user,
      save_results: save_results,
      parsed_dependencies: audit_data,
      masked_data_resolutions: resolution_mapping,
      chat: ai_assistant_chat,
      campaign_user: campaign_user
    )
  end

  let(:user) { create(:user, first_name: 'John', last_name: 'Doe', email: 'john@example.com') }
  let!(:client) { create(:tenancy) }
  let!(:assistant_with_schema) do
    create(:assistant, owner: client, model_id: 'azure-openai').tap do |asst|
      asst.assistant_output_schema_keys.create!(
        key: 'summary',
        description: 'Some description',
        key_type: 'string'
      )
    end
  end
  let(:artifact) { create(:campaign_ai_artifact, ai_assistant: assistant_with_schema) }
  let!(:campaign_user) { create(:campaign_user, campaign: artifact.campaign, user: user) }
  let(:save_results) { false }
  let(:audit_data) { 'This is audit data for what was sent to LLM' }
  let(:resolution_mapping) { {} }
  let(:ai_assistant_chat) { create(:assistant_chat, ai_assistant: assistant_with_schema, user: user) }

  describe '#execute' do
    context 'without masked_data_resolutions' do
      let(:results_json) { '{"summary": "Hello there, no masking applied"}' }

      it 'returns results without any resolution' do
        expect(artifact).to receive(:validate_results_schema).and_return([])

        expect do
          subject.execute(results: results_json)
        end.to raise_error(AI::Utils::SuccessfulCompletionSignal) do |signal|
          result = signal.data
          expect(result['summary']).to eq('Hello there, no masking applied')
        end
      end
    end

    context 'with masked_data_resolutions' do
      let(:resolution_mapping) do
        {
          "USRFN#{user.id}" => 'John',
          "USRLN#{user.id}" => 'Doe',
          "USR#{user.id}@masked.local" => 'john@example.com'
        }
      end
      let(:results_json) { "{\"summary\": \"Hello USRFN#{user.id}, email: USR#{user.id}@masked.local\"}" }

      it 'resolves masked data back to actual data' do
        expect(artifact).to receive(:validate_results_schema).and_return([])

        expect do
          subject.execute(results: results_json)
        end.to raise_error(AI::Utils::SuccessfulCompletionSignal) do |signal|
          result = signal.data
          expect(result['summary']).to eq('Hello John, email: john@example.com')
          expect(result['summary']).not_to include("USRFN#{user.id}")
          expect(result['summary']).not_to include("USR#{user.id}@masked.local")
        end
      end
    end

    context 'when save_results is true' do
      let(:save_results) { true }
      let(:results_json) { '{"summary": "Test summary to save"}' }

      it 'creates a result record with resolved data and audit information' do
        expect(artifact).to receive(:validate_results_schema).and_return([]).at_least(:once)

        expect do
          subject.execute(results: results_json)
        end.to raise_error(AI::Utils::SuccessfulCompletionSignal) do |signal|
          result = signal.data
          expect(result['summary']).to eq('Test summary to save')
        end

        # Verify the record was created
        artifact_result = artifact.results.find_by(user: user)
        expect(artifact_result).to be_present
        expect(artifact_result.results['summary']).to eq('Test summary to save')
        expect(artifact_result.parsed_dependencies).to eq(audit_data)
      end
    end

    context 'when validation errors occur' do
      let(:results_json) { '{"invalid_field": "some value"}' }

      it 'returns formatted validation error message' do
        expect(artifact).to receive(:validate_results_schema).
          and_return(['is missing required keys: \'summary\'', 'contains unexpected keys: \'invalid_field\''])

        result = subject.execute(results: results_json)

        expect(result[:error]).to be_a(String)
        expect(result[:error]).to include('Validation failed')
        expect(result[:error]).to include("results is missing required keys: 'summary'")
        expect(result[:error]).to include("results contains unexpected keys: 'invalid_field'")
      end

      it 'returns formatted error even when save_results is false' do
        expect(artifact).to receive(:validate_results_schema).
          and_return(['executive_summary should be a string'])

        result = subject.execute(results: results_json)

        expect(result[:error]).to eq('Validation failed: results executive_summary should be a string')
      end
    end

    context 'when validation errors occur with save_results true' do
      let(:save_results) { true }
      let(:results_json) { '{"executive_summary": null, "data_missing": ""}' }

      it 'returns validation error without attempting to save invalid data' do
        expect(artifact).to receive(:validate_results_schema).
          and_return(['executive_summary should be a string'])

        # Ensure save is never attempted
        expect(artifact).not_to receive(:results)

        result = subject.execute(results: results_json)

        expect(result[:error]).to eq('Validation failed: results executive_summary should be a string')
      end
    end

    context 'retry mechanism' do
      let(:results_json) { '{"invalid_field": "some value"}' }
      let(:validation_error) { 'is missing required keys: \'summary\'' }
      let(:formatted_error) { 'Validation failed: results is missing required keys: \'summary\'' }

      it 'tracks retry attempts and raises error after exceeding max retries of 2' do
        expect(artifact).to receive(:validate_results_schema).and_return([validation_error]).exactly(3).times

        result1 = subject.execute(results: results_json)
        expect(result1).to eq({ error: formatted_error })

        result2 = subject.execute(results: results_json)
        expect(result2).to eq({ error: formatted_error })

        # Third attempt should raise MaximumRetryAttemptsExceededError
        expect do
          subject.execute(results: results_json)
        end.to raise_error(AI::Tools::Errors::MaximumRetryAttemptsExceededError) do |error|
          expect(error.tool_name).to eq('AI::Tools::CampaignArtifactResultManager')
          expect(error.attempt_count).to eq(3)
          expect(error.max_retries).to eq(2) # Tool is configured with max_retry_attempts 2
          expect(error.last_error_message).to eq(formatted_error)
          expect(error.message).to include('exceeded maximum retry attempts')
          expect(error.message).to include('Last error:')
        end
      end

      it 'resets retry count on successful execution' do
        expect(artifact).to receive(:validate_results_schema).and_return([validation_error]).once
        result1 = subject.execute(results: results_json)
        expect(result1).to eq({ error: formatted_error })

        # Succeed should reset retry count
        valid_results_json = '{"summary": "Valid summary"}'
        expect(artifact).to receive(:validate_results_schema).and_return([]).once

        expect do
          subject.execute(results: valid_results_json)
        end.to raise_error(AI::Utils::SuccessfulCompletionSignal)

        # Now error again - should start from retry count 0
        expect(artifact).to receive(:validate_results_schema).and_return([validation_error]).exactly(2).times

        result3 = subject.execute(results: results_json)
        expect(result3).to eq({ error: formatted_error })

        result4 = subject.execute(results: results_json)
        expect(result4).to eq({ error: formatted_error })

        expect(artifact).to receive(:validate_results_schema).and_return([validation_error]).once
        expect do
          subject.execute(results: results_json)
        end.to raise_error(AI::Tools::Errors::MaximumRetryAttemptsExceededError)
      end

      it 'handles different types of error messages' do
        invalid_json = 'invalid json string {['

        result1 = subject.execute(results: invalid_json)
        expect(result1[:error]).to be_present
        expect(result1[:error]).to be_a(String)

        result2 = subject.execute(results: invalid_json)
        expect(result2[:error]).to be_present
        expect(result2[:error]).to be_a(String)

        expect do
          subject.execute(results: invalid_json)
        end.to raise_error(AI::Tools::Errors::MaximumRetryAttemptsExceededError) do |error|
          expect(error.last_error_message).to be_a(String)
          expect(error.message).to include('Last error:')
        end
      end
    end

    context 'when JSON parsing errors occur' do
      let(:results_json) { 'invalid json string {[' }

      it 'returns JSON parsing error' do
        result = subject.execute(results: results_json)

        expect(result[:error]).to be_present
        expect(result[:error]).to be_a(String)
        expect(result[:error]).to match(/JSON|parse|unexpected/i)
      end
    end

    context 'when database save fails' do
      let(:save_results) { true }
      let(:results_json) { '{"summary": "Test summary"}' }

      it 'returns error on ActiveRecord::RecordInvalid' do
        expect(artifact).to receive(:validate_results_schema).and_return([])

        # Mock the save to fail
        artifact_result = double('artifact_result')
        expect(artifact).to receive_message_chain(:results,
                                                  :find_or_initialize_by).with(user: user).and_return(artifact_result)
        expect(artifact_result).to receive(:results=)
        expect(artifact_result).to receive(:parsed_dependencies=)
        expect(artifact_result).to receive(:content_checksum=)
        expect(artifact_result).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(user))

        result = subject.execute(results: results_json)

        expect(result[:error]).to be_present
        expect(result[:error]).to be_a(String)
      end
    end
  end

  describe 'initialization' do
    it 'handles default parameter values correctly' do
      manager = described_class.new(artifact, user)

      expect { manager }.not_to raise_error
    end

    it 'handles nil masked_data_resolutions parameter' do
      manager = described_class.new(artifact, user, masked_data_resolutions: nil)

      expect(artifact).to receive(:validate_results_schema).and_return([])
      expect do
        manager.execute(results: '{"summary": "test"}')
      end.to raise_error(AI::Utils::SuccessfulCompletionSignal)
    end
  end
end
