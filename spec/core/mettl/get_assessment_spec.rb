# frozen_string_literal: true

require 'rails_helper'

describe Mettl::GetAssessments do
  let!(:project) { create(:project) }
  let!(:mettl_integration) { create(:integration, :mettl_integration, project: project) }
  let!(:assessment_response) do
    {
      'id' => 1_241_794,
      'duration' => 45,
      'name' => 'Mettl Personality Map',
      'instructions' => '',
      'defaultInstructions' => '<h2><b>THINGS TO REMEMBER</b></h2>',
      'registrationFields' =>
      [
        { 'name' => 'Email Address', 'type' => 'TextBox', 'required' => true, 'validate' => false },
        { 'name' => 'First Name', 'type' => 'TextBox', 'required' => true, 'validate' => false }
      ]
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: { 'assessments' => [assessment_response] }.to_json) }

  subject { described_class.new(project) }

  before do
    allow(subject).to receive(:client).and_return(client)
  end

  describe '#call' do
    context 'when config is not present' do
      before do
        mettl_integration.destroy
      end

      it 'broadcasts :ok with an empty array' do
        expect(subject).to receive(:broadcast).with(:ok, [])
        subject.call
      end
    end

    context 'when config is present' do
      context 'and the API call is successful' do
        before do
          allow(client).to receive(:get).and_return(response)
        end

        it 'broadcasts :ok with the assessments' do
          expect(subject).to receive(:broadcast).with(:ok, [assessment_response])
          subject.call
        end
      end

      context 'and the API call raises an error' do
        before do
          allow(client).to receive(:get).and_raise(Faraday::Error.new('error'))
        end

        it 'captures the exception and broadcasts :ok with an empty array' do
          expect(Sentry).to receive(:capture_exception).with(instance_of(Faraday::Error),
                                                             extra: { project_id: project.id })
          expect(subject).to receive(:broadcast).with(:ok, [])
          subject.call
        end
      end
    end
  end
end
