# frozen_string_literal: true

require 'rails_helper'

describe Mhs::CreateEnrichmentResult do
  let!(:project) { create(:project) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :mhs, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project, campaign: campaign) }
  let!(:mhs_user_assessment) { create(:mhs_user_assessment, user_assessment: user_assessment) }
  let(:report) { create(:report, :mhs, assessments: [assessment]) }
  let!(:user_report) { create(:user_report, user: user_assessment.subject, campaign: campaign, report: report) }

  let(:session_id) { 'test-session-id-1234-5678-9abc-def012345678' }
  let(:enrichment_id) { 'bc791135-086f-4d67-a8c1-cea00c003ded' } # Workplace Client Report ID
  let(:measure_id) { 'test-measure-id-wxyz-0123-4567-890abcdef123' }

  let!(:mhs_response) do
    {
      'createDate' => '2025-12-18T11:15:48.2283956Z',
      'createIPAddress' => '172.68.146.172',
      'details' => [
        {
          'code' => 200,
          'description' => 'Enrichment created in session.',
          'locationReference' => '041',
          'reference' => 'LA0100'
        }
      ],
      'resources' => [
        {
          'enrichmentID' => enrichment_id,
          'measureID' => measure_id,
          'links' => [
            {
              'format' => 'PDF',
              'href' => 'https://example.com/test-report.pdf'
            }
          ]
        }
      ]
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: mhs_response.to_json) }

  subject { described_class.new(user_assessment, user_report) }

  before do
    # Mock assessment settings with report-specific directives
    assessment_settings = double('assessment_settings')
    workplace_client_report = double('report', id: enrichment_id, directives: [
      { key: 'Language', value: 'en-US' },
      { key: 'NormRegion', value: '0' },
      { key: 'NormOption', value: '1' }
    ])
    reports = [workplace_client_report]
    allow(assessment_settings).to receive(:reports).and_return(reports)
    allow(subject).to receive(:assessment_settings).and_return(assessment_settings)

    # Mock users_result with external_results
    users_result = instance_double('UsersResult')
    allow(users_result).to receive(:external_results).and_return({
      'outcome_item_sets' => [
        {
          'name' => 'TOTAL SCORE (TOT)',
          'outcomeSetID' => 'test-outcome-set-id-1234',
          'outcomeItems' => '0|354|59|3|54|64'
        }
      ]
    })
    allow(user_assessment).to receive(:users_result).and_return(users_result)

    # Mock the report external_settings to return the correct enrichment_id
    allow(user_report).to receive(:report).and_return(double('report', external_settings: { report_id: enrichment_id }))

    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
    allow(response).to receive(:body).and_return(mhs_response.to_json)
    allow(response).to receive(:success?).and_return(true)
  end

  describe '#call' do
    context 'when MHS API call succeeds' do
      it 'creates enrichment with PDF URL' do
        result = nil
        expect(subject).to receive(:broadcast).with(:ok, anything) do |_status, data|
          result = data
        end

        subject.call

        expect(result[:enrichment]).to be_present
        expect(result[:pdf]).to eq('https://example.com/test-report.pdf')
      end

      it 'includes directives in the request body' do
        expect(client).to receive(:post) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)
          allow(req).to receive(:headers).and_return({})

          expect(req).to receive(:body=) do |body|
            parsed_body = JSON.parse(body)
            enrichment_results = parsed_body['enrichmentResults']
            expect(enrichment_results).to be_an(Array)
            expect(enrichment_results.first['directives']).to be_present
            expect(enrichment_results.first['directives']['keyValuePairsArray']).to be_an(Array)
            expect(enrichment_results.first['directives']['keyValuePairsArray']).to include(
              { 'key' => 'Language', 'value' => 'en-US' },
              { 'key' => 'NormRegion', 'value' => '0' },
              { 'key' => 'NormOption', 'value' => '1' }
            )
          end

          block.call(req)
        end.and_return(response)

        subject.call
      end

      it 'sends the correct request body structure' do
        expect(client).to receive(:post) do |&block|
          req = instance_double('Faraday::Request')
          allow(req).to receive(:url)
          allow(req).to receive(:headers).and_return({})

          expect(req).to receive(:body=) do |body|
            parsed_body = JSON.parse(body)
            expect(parsed_body['enrichmentResults']).to be_an(Array)
            expect(parsed_body['enrichmentResults'].first['resourceType']).to eq('Enrichment')
            expect(parsed_body['enrichmentResults'].first['enrichmentID']).to be_present
            expect(parsed_body['enrichmentResults'].first['observationItemSets']).to be_an(Array)
            expect(parsed_body['enrichmentResults'].first['outcomeItemSets']).to be_an(Array)
            expect(parsed_body['retentionPolicy']['type']).to eq('Default')
            expect(parsed_body['host']).to have_key('computeProvider')
            expect(parsed_body['host']).to have_key('storageProvider')
            expect(parsed_body['host']['invokeAsAsynchronous']).to be false
            expect(parsed_body['eventNotifications']).to be_a(Hash)
            expect(parsed_body['runAs']).to have_key('identifier')
          end

          block.call(req)
        end.and_return(response)

        subject.call
      end
    end
  end

  context 'with different report types' do
    it 'uses different directives for different report types' do
      # Test with Leadership Coach Report which has different directives
      leadership_coach_id = '3f584d17-f016-4ca7-a0fd-a63534f6c45b'

      # Mock the assessment settings to include different report types
      assessment_settings = double('assessment_settings')
      leadership_coach_report = double('report', id: leadership_coach_id, directives: [
        { key: 'Language', value: 'en-US' },
        { key: 'LeadershipBar', value: '0' },
        { key: 'ConfidenceInterval', value: '0' },
        { key: 'NormRegion', value: '0' },
        { key: 'NormOption', value: '0' }
      ])
      reports = [leadership_coach_report]
      allow(assessment_settings).to receive(:reports).and_return(reports)
      allow(subject).to receive(:assessment_settings).and_return(assessment_settings)

      # Change the user_report to use Leadership Coach Report
      allow(user_report).to receive(:report).and_return(double('report',
                                                               external_settings: { report_id: leadership_coach_id }))

      expect(client).to receive(:post) do |&block|
        req = instance_double('Faraday::Request')
        allow(req).to receive(:url)
        allow(req).to receive(:headers).and_return({})

        expect(req).to receive(:body=) do |body|
          parsed_body = JSON.parse(body)
          enrichment_results = parsed_body['enrichmentResults']
          directive_pairs = enrichment_results.first['directives']['keyValuePairsArray']

          # Should have all 5 directives for Leadership Coach
          expect(directive_pairs.length).to eq(5)
          expect(directive_pairs).to include(
            { 'key' => 'Language', 'value' => 'en-US' },
            { 'key' => 'LeadershipBar', 'value' => '0' },
            { 'key' => 'ConfidenceInterval', 'value' => '0' },
            { 'key' => 'NormRegion', 'value' => '0' },
            { 'key' => 'NormOption', 'value' => '0' }
          )
        end

        block.call(req)
      end.and_return(response)

      subject.call
    end
  end
end
