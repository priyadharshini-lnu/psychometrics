# frozen_string_literal: true

require 'rails_helper'

describe Pearson::SaveScoresAndReports do
  let(:user) { create(:user) }
  let(:assessment) { create(:assessment, :pearson) }
  let(:user_assessment) { create(:user_assessment, subject: user, assessment: assessment, status: :in_progress) }
  let(:users_result) { create(:users_result, user_assessment: user_assessment) }
  let(:pearson_user_assessment) do
    create(:pearson_user_assessment, user_assessment: user_assessment, schedule_id: 'test-schedule-id')
  end
  let(:report) { create(:report, :pearson, assessments: [assessment], provider: 'pearson') }
  let(:user_report) { create(:user_report, report: report) }
  let(:config) { Settings.secrets.pearson }
  let(:scores) do
    [
      { 'id' => 'score1', 'raw' => 10, 'scaled' => 20 },
      { 'id' => 'score2', 'raw' => 15, 'scaled' => 30 }
    ]
  end
  let(:report_items) do
    [
      { 'type' => 'PDF', 'url' => 'https://example.com/report1.pdf', 'languageCode' => 'en-US' }
    ]
  end
  let(:response_body) do
    {
      'data' => {
        'candidates' => [
          {
            'products' => [
              {
                'results' => {
                  'scores' => { 'items' => scores },
                  'reports' => { 'items' => report_items }
                }
              }
            ]
          }
        ]
      }
    }
  end

  before do
    allow(Pearson::GetAuthToken).to receive(:call!)

    allow_any_instance_of(Assessment).to receive(:v2_pearson_assessment?).and_return(true)
    allow_any_instance_of(Assessment).to receive(:external_assessment_id).and_return('test-assessment-id')
    allow_any_instance_of(Assessment).to receive(:pearson_report_id).and_return('test-report-id')

    allow_any_instance_of(UserAssessment).to receive(:user_reports).with(:pearson).and_return([user_report])
    allow_any_instance_of(UserAssessment).to receive(:pearson_norm_id).and_return('test-norm-id')
  end

  describe '#call' do
    context 'when API returns scores and reports' do
      before do
        stub_request(:get, "#{config[:base_api_url]}/v1/results/#{pearson_user_assessment.schedule_id}").
          with(query: { products: [{ productId: 'test-assessment-id', normId: 'test-norm-id',
                                     reportId: ['test-report-id'] }], includeSessionData: '1' }.to_query).
          to_return(body: response_body.to_json)

        allow_any_instance_of(Report).to receive(:default_language).and_return('en')
        allow_any_instance_of(UserReport).to receive(:report_name_for_download).and_return('test-report.pdf')
        allow_any_instance_of(UserReport).to receive(:attach_pdf!)
        allow(UsersResults::GenerateReports).to receive(:call)
      end

      it 'updates external_results with scores' do
        expect { described_class.new(user_assessment).call }.
          to change { users_result.reload.external_results }.
          to(scores)
      end

      it 'updates user_assessment status and completed_at' do
        expect { described_class.new(user_assessment).call }.
          to change { user_assessment.reload.status }.
          from('in_progress').
          to('completed').
          and change { user_assessment.reload.completed_at }.
          from(nil)
      end

      it 'attaches PDF to user report' do
        expect_any_instance_of(UserReport).to receive(:attach_pdf!).
          with('https://example.com/report1.pdf', 'test-report.pdf')

        described_class.new(user_assessment).call
      end

      it 'broadcasts :ok' do
        result = described_class.new(user_assessment).call

        expect(result).to broadcast(:ok)
      end
    end

    context 'when API returns scores but no reports' do
      before do
        response_body['data']['candidates'][0]['products'][0]['results']['reports']['items'] = []

        stub_request(:get, "#{config[:base_api_url]}/v1/results/#{pearson_user_assessment.schedule_id}").
          with(query: { products: [{ productId: 'test-assessment-id', normId: 'test-norm-id',
                                     reportId: ['test-report-id'] }], includeSessionData: '1' }.to_query).
          to_return(body: response_body.to_json)

        allow(UsersResults::GenerateReports).to receive(:call)
      end

      it 'updates external_results with scores' do
        expect { described_class.new(user_assessment).call }.
          to change { users_result.reload.external_results }.
          to(scores)
      end

      it 'does not attach PDF to user report' do
        expect_any_instance_of(UserReport).not_to receive(:attach_pdf!)

        described_class.new(user_assessment).call
      end

      it 'broadcasts :ok' do
        result = described_class.new(user_assessment).call

        expect(result).to broadcast(:ok)
      end
    end

    context 'when API returns no scores' do
      before do
        response_body['data']['candidates'][0]['products'][0]['results']['scores']['items'] = []

        stub_request(:get, "#{config[:base_api_url]}/v1/results/#{pearson_user_assessment.schedule_id}").
          with(query: { products: [{ productId: 'test-assessment-id', normId: 'test-norm-id',
                                     reportId: ['test-report-id'] }], includeSessionData: '1' }.to_query).
          to_return(body: response_body.to_json)

        stub_request(:get, 'https://example.com/report1.pdf').
          to_return(status: 200, body: 'PDF content', headers: { 'Content-Type' => 'application/pdf' })

        file_double = StringIO.new('PDF content')
        allow(URI).to receive(:open).with('https://example.com/report1.pdf').and_return(file_double)
      end

      it 'does not update external_results' do
        expect { described_class.new(user_assessment).call }.
          not_to(change { users_result.reload.external_results })
      end

      it 'does not update user_assessment status' do
        expect { described_class.new(user_assessment).call }.
          not_to(change { user_assessment.reload.status })
      end

      it 'still attaches PDF to user report if available' do
        allow_any_instance_of(Report).to receive(:default_language).and_return('en')
        allow_any_instance_of(UserReport).to receive(:report_name_for_download).and_return('test-report.pdf')
        allow_any_instance_of(UserReport).to receive(:attach_pdf!)

        described_class.new(user_assessment).call
      end
    end

    context 'when no user report exists' do
      before do
        stub_request(:get, "#{config[:base_api_url]}/v1/results/#{pearson_user_assessment.schedule_id}").
          with(query: { products: [{ productId: 'test-assessment-id', normId: 'test-norm-id',
                                     reportId: ['test-report-id'] }], includeSessionData: '1' }.to_query).
          to_return(body: response_body.to_json)

        allow_any_instance_of(UserAssessment).to receive(:user_reports).with(:pearson).and_return(UserReport.none)
        allow(UsersResults::GenerateReports).to receive(:call)
      end

      it 'updates external_results with scores' do
        expect { described_class.new(user_assessment).call }.
          to change { users_result.reload.external_results }.
          to(scores)
      end

      it 'does not try to attach PDF' do
        expect_any_instance_of(UserReport).not_to receive(:attach_pdf!)

        described_class.new(user_assessment).call
      end

      it 'broadcasts :ok' do
        result = described_class.new(user_assessment).call

        expect(result).to broadcast(:ok)
      end
    end

    context 'when API returns no scores and no reports' do
      before do
        response_body['data']['candidates'][0]['products'][0]['results']['scores']['items'] = []
        response_body['data']['candidates'][0]['products'][0]['results']['reports']['items'] = []

        stub_request(:get, "#{config[:base_api_url]}/v1/results/#{pearson_user_assessment.schedule_id}").
          with(query: { products: [{ productId: 'test-assessment-id', normId: 'test-norm-id',
                                     reportId: ['test-report-id'] }], includeSessionData: '1' }.to_query).
          to_return(body: response_body.to_json)
      end

      it 'raises an error for missing scores and reports' do
        expect { described_class.new(user_assessment).call }.
          to raise_error(StandardError, 'Pearson assessment scores and reports not available')
      end
    end
  end
end
