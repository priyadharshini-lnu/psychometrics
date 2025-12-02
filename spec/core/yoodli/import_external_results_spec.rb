# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Yoodli::ImportExternalResults do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user, email: 'test@example.com', project: campaign.project) }
  let(:user_assessment) { create(:user_assessment, campaign: campaign, subject: user) }
  let(:users_result) { create(:users_result, user_assessment: user_assessment) }
  let(:yoodli_user_assessment) do
    create(:yoodli_user_assessment, user_assessment: user_assessment, email: 'test@example.com')
  end

  let(:temp_file) do
    double('file')
  end

  before do
    csv_data = [
      ['orgId', 'scenarioId', 'scenarioName', 'userEmail', 'userName', 'userId', 'signupDate', 'goalName',
       'numAttemptStarted', 'firstScore', 'maxScore', 'lastScore', 'avgScore'],
      ['org123', 'scenario456', 'Test Scenario', 'test@example.com', 'Test User', 'yoodli/user123', '2025-01-01',
       'Communication Skills', '3', '75.0', '85.0', '80.0', '78.5'],
      ['org123', 'scenario456', 'Test Scenario', 'test@example.com', 'Test User', 'yoodli/user123', '2025-01-01',
       'Leadership', '2', '60.0', '70.0', '65.0', '62.5'],
      ['org123', 'scenario789', 'Another Scenario', 'unknown@example.com', 'Unknown User', 'yoodli/user456',
       '2025-01-02', 'Public Speaking', '1', '50.0', '50.0', '50.0', '50.0']
    ]

    csv_rows = csv_data[1..].map do |row_data|
      headers = csv_data[0]
      row_hash = headers.zip(row_data).to_h
      double('csv_row', to_h: row_hash)
    end

    allow(CsvFileParser).to receive(:call!).with(temp_file, headers: :first_row).and_return(csv_rows)

    yoodli_user_assessment
    users_result
  end

  describe '.call' do
    subject { described_class.call(file: temp_file, campaign: campaign) }

    context 'with valid CSV file' do
      it 'successfully processes the CSV' do
        expect(subject[:success]).to be true
        expect(subject[:processed_users]).to eq 1
        expect(subject[:errors]).to be_empty
      end

      it 'saves external results to the database' do
        subject

        external_results = users_result.reload.external_results
        expect(external_results['user_info']['user_name']).to eq 'Test User'
        expect(external_results['user_info']['email']).to eq 'test@example.com'
        expect(external_results['goals']).to have_key('Communication Skills')
        expect(external_results['goals']).to have_key('Leadership')
      end

      it 'stores correct goal data' do
        subject

        external_results = users_result.reload.external_results
        communication_goal = external_results['goals']['Communication Skills']

        expect(communication_goal['scenario_id']).to eq 'scenario456'
        expect(communication_goal['scenario_name']).to eq 'Test Scenario'
        expect(communication_goal['num_attempt_started']).to eq 3
        expect(communication_goal['first_score']).to eq 75.0
        expect(communication_goal['max_score']).to eq 85.0
        expect(communication_goal['last_score']).to eq 80.0
        expect(communication_goal['avg_score']).to eq 78.5
      end
    end

    context 'when scenario ID does not match external_assessment_id' do
      let(:assessment_with_different_scenario) do
        create(:assessment,
               type: 'Assessments::Yoodli',
               category: :yoodli,
               external_settings: { assessment_id: 'different_scenario' })
      end
      let(:user_assessment_with_different_scenario) do
        create(:user_assessment, campaign: campaign, subject: user, assessment: assessment_with_different_scenario)
      end
      let(:users_result_with_different_scenario) do
        create(:users_result, user_assessment: user_assessment_with_different_scenario)
      end
      let(:yoodli_user_assessment) do
        create(:yoodli_user_assessment, user_assessment: user_assessment_with_different_scenario,
email: 'test@example.com')
      end
      let(:users_result) { users_result_with_different_scenario }

      it 'reports scenario ID mismatch error' do
        expect(subject[:success]).to be false
        expect(subject[:processed_users]).to eq 0
        expect(subject[:errors]).to include(match(/Scenario ID mismatch for test@example.com/))
      end
    end

    context 'when user email is not found' do
      it 'silently ignores unknown users' do
        expect(subject[:success]).to be true
        expect(subject[:processed_users]).to eq 1
        expect(subject[:errors]).to be_empty
      end
    end

    context 'with CSV content string' do
      let(:csv_content) do
        <<~CSV
          orgId,scenarioId,scenarioName,userEmail,userName,userId,signupDate,goalName,numAttemptStarted,firstScore,maxScore,lastScore,avgScore
          org123,scenario456,Test Scenario,test@example.com,Test User,yoodli/user123,2025-01-01,Communication Skills,3,75.0,85.0,80.0,78.5
          org123,scenario456,Test Scenario,test@example.com,Test User,yoodli/user123,2025-01-01,Leadership,2,60.0,70.0,65.0,62.5
        CSV
      end

      subject { described_class.call(file: nil, campaign: campaign, csv_content: csv_content) }

      it 'successfully processes CSV content' do
        expect(subject[:success]).to be true
        expect(subject[:processed_users]).to eq 1
        expect(subject[:errors]).to be_empty
      end

      it 'saves external results from CSV content' do
        subject

        external_results = users_result.reload.external_results
        expect(external_results['user_info']['user_name']).to eq 'Test User'
        expect(external_results['goals']).to have_key('Communication Skills')
        expect(external_results['goals']).to have_key('Leadership')
      end
    end

    context 'without campaign (finds user across all campaigns)' do
      subject { described_class.call(file: temp_file) }

      it 'successfully processes without specifying campaign' do
        expect(subject[:success]).to be true
        expect(subject[:processed_users]).to eq 1
        expect(subject[:errors]).to be_empty
      end
    end

    context 'with neither file nor csv_content' do
      subject { described_class.call }

      it 'returns error when no input provided' do
        expect(subject[:success]).to be false
        expect(subject[:errors]).to include('No file or CSV content provided')
      end
    end

    context 'when goals data has not changed' do
      before do
        existing_external_results = {
          'imported_at' => '2025-12-01T10:00:00Z',
          'user_info' => {
            'user_name' => 'Test User',
            'user_id' => 'yoodli/user123',
            'email' => 'test@example.com',
            'signup_date' => '2025-01-01'
          },
          'goals' => {
            'Communication Skills' => {
              'scenario_id' => 'scenario456',
              'scenario_name' => 'Test Scenario',
              'num_attempt_started' => 3,
              'first_score' => 75.0,
              'max_score' => 85.0,
              'last_score' => 80.0,
              'avg_score' => 78.5
            },
            'Leadership' => {
              'scenario_id' => 'scenario456',
              'scenario_name' => 'Test Scenario',
              'num_attempt_started' => 2,
              'first_score' => 60.0,
              'max_score' => 70.0,
              'last_score' => 65.0,
              'avg_score' => 62.5
            }
          }
        }
        users_result.update!(external_results: existing_external_results)
      end

      it 'skips database update when goals have not changed' do
        original_imported_at = users_result.external_results['imported_at']

        expect { subject }.not_to(change { users_result.reload.external_results['imported_at'] })
        expect(users_result.external_results['imported_at']).to eq original_imported_at
      end

      it 'still reports successful processing' do
        expect(subject[:success]).to be true
        expect(subject[:processed_users]).to eq 1
        expect(subject[:errors]).to be_empty
      end
    end

    context 'when goals data has changed' do
      before do
        existing_external_results = {
          'imported_at' => '2025-12-01T10:00:00Z',
          'user_info' => {
            'user_name' => 'Test User',
            'user_id' => 'yoodli/user123',
            'email' => 'test@example.com',
            'signup_date' => '2025-01-01'
          },
          'goals' => {
            'Communication Skills' => {
              'scenario_id' => 'scenario456',
              'scenario_name' => 'Test Scenario',
              'num_attempt_started' => 2,
              'first_score' => 70.0,
              'max_score' => 80.0,
              'last_score' => 75.0,
              'avg_score' => 73.5
            }
          }
        }
        users_result.update!(external_results: existing_external_results)
      end

      it 'updates database when goals have changed' do
        original_imported_at = users_result.external_results['imported_at']

        subject

        expect(users_result.reload.external_results['imported_at']).not_to eq original_imported_at
        expect(users_result.external_results['goals']['Communication Skills']['avg_score']).to eq 78.5
        expect(users_result.external_results['goals']).to have_key('Leadership')
      end
    end
  end
end
