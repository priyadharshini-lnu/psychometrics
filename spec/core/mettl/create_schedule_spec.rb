# frozen_string_literal: true

require 'rails_helper'

describe Mettl::CreateSchedule do
  let!(:project) { create(:project) }
  let!(:mettl_integration) { create(:integration, :mettl_integration, project: project) }
  let!(:mettl_assessment) { create(:mettl_assessment, project_id: project.id) }
  let(:assessment) do
    create(:assessment, :mettl, project: project, external_settings: { assessment_id: mettl_assessment.product_id })
  end

  let!(:schedule_response) do
    {
      status: 'SUCCESS',
      'createdSchedule' => {
        'assessmentId' => 1_241_794,
        'id' => 16_388_921,
        'name' => 'Schedule Name1',
        'accessKey' => '7bmicsn75s',
        'accessUrl' => 'https://tests.mettl.com/authenticateKey/7bmicsn75s',
        'status' => 'ACTIVE'
      }
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: schedule_response.to_json) }

  subject { described_class.new(assessment) }

  before do
    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
    allow(response).to receive(:body).and_return(schedule_response.to_json)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'created mettl_schedule' do
        subject.call

        mettl_schedule = MettlSchedule.last

        expect(mettl_schedule.project_id).to eq(project.id)
        expect(mettl_schedule.assessment_id).to eq(assessment.id)
        expect(mettl_schedule.schedule_id).to eq(16_388_921)
        expect(mettl_schedule.access_key).to eq('7bmicsn75s')
        expect(mettl_schedule.access_url).to eq('https://tests.mettl.com/authenticateKey/7bmicsn75s')
      end
    end

    context 'when trying to create a duplicate assessment' do
      before do
        allow(subject).to receive(:client).and_return(double(post: double(
          body: '{"status":"ERROR","error":{"code":"E000","message":"Please use unique title for Schedule"}}'
        )))
      end

      it 'raises an error with the correct message' do
        expect do
          subject.call
        end.to raise_error(RuntimeError) do |error|
          expect(error.message).to eq(
            "Mettl::CreateSchedule failed for Assessment: #{assessment.id}. Error: Please use unique title for Schedule"
          )
        end
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
        subject.call
      end

      it 'broadcasts :ok with an empty array' do
        expect(subject).to receive(:broadcast).with(:ok, [])
        subject.call
      end
    end
  end
end
