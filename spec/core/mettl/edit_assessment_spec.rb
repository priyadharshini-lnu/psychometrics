# frozen_string_literal: true

require 'rails_helper'

describe Mettl::EditAssessment do
  let!(:project) { create(:project) }
  let!(:mettl_integration) { create(:integration, :mettl_integration, project: project) }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.product_id })
  end

  let(:request_body) { { some_key: 'some_value' } }
  let(:service) { described_class.new(mettl_assessment, request_body) }
  let(:success_response) do
    {
      status: 'SUCCESS',
      assessment: {
        id: 1_225_766,
        duration: 10,
        testsTaken: 18,
        name: 'Ruby on Rails',
        instructions: '',
        defaultInstructions: '<h2><b>THINGS TO REMEMBER</b></h2>...',
        allowCopyPaste: true,
        exitRedirectionURL: 'http://3835.ttedev.me:3030/mettl/assessment/10000006',
        customAssessmentName: '',
        showReportToCandidateOnExit: false,
        onScreenCalculator: true,
        fixedSectionOrder: false,
        createdAt: 'Tue, 16 Jul 2024 07:17:50 GMT',
        maxMarks: 1.0,
        markingScheme: 'FIXED',
        assessmentType: 'REGULAR',
        enableQRUpload: false
      }
    }.to_json
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: success_response) }

  before do
    allow(service).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
    allow(response).to receive(:body).and_return(success_response)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'broadcasts :ok with the result' do
        expect(service).to receive(:broadcast).with(:ok, JSON.parse(success_response))
        service.call
      end
    end

    context 'when there is a Faraday error' do
      let(:error) { Faraday::Error.new('Connection failed') }

      before do
        allow(client).to receive(:post).and_raise(error)
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures the exception with Sentry' do
        expect(Sentry).to receive(:capture_exception).with(error, extra: { project_id: project.id })
        service.call
      end

      it 'broadcasts :ok' do
        expect(service).to receive(:broadcast).with(:ok)
        service.call
      end
    end
  end
end
