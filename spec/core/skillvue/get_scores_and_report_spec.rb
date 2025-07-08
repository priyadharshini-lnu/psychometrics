# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skillvue::GetScoresAndReport do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, :skillvue, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let!(:skillvue_user_assessment) do
    create(:skillvue_user_assessment,
           user_assessment: user_assessment,
           external_user_id: 'Pm9xGP')
  end

  let(:api_response) do
    {
      'success' => true,
      'error' => nil,
      'data' => {
        'type' => 'report.ready',
        'pdfUrl' => 'https://gpt-reports-storage.s3.eu-west-1.amazonaws.com/demo/7dfa68f8d27ca39f5743d2f41d700b43/report_pro.pdf',
        'userId' => 'Pm9xGP',
        'payload' => {
          'date' => '18/06/2025',
          'email' => 'pm9xgp-e1990d5fd2@example.com',
          'job_name' => 'MTE Test',
          'full_name' => '23670 23670',
          'hard_skills' => [],
          'soft_skills' => [
            {
              'name' => 'Teamworking',
              'score' => 3,
              'duration' => 360,
              'questions' => [
                {
                  'answer' => 'You have achieved a great success working as a team...',
                  'content' => 'You have achieved great success working as a team. What were the elements that led you to success?', # rubocop:disable Layout/LineLength
                  'duration' => 120,
                  'key_concepts' => [
                    {
                      'name' => 'Fostering dialogue',
                      'score' => 3,
                      'justification' => 'Shows some effort in encouraging communication but lacks depth in illustrating continuous exchange.' # rubocop:disable Layout/LineLength
                    },
                    {
                      'name' => 'Collaborating with colleagues',
                      'score' => 4,
                      'justification' => 'Emphasizes teamwork and mutual support effectively with practical examples.'
                    }
                  ],
                  'overall_score' => 3,
                  'overall_comment' => 'The response reflects a proactive and goal-oriented team player...'
                }
              ]
            }
          ]
        }
      }
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, body: api_response.to_json, success?: true) }

  subject { described_class.new(user_assessment) }

  before do
    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_return(response)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'broadcasts the report data' do
        expect { subject.call }.to broadcast(:ok, api_response['data'])
      end

      it 'makes request to the correct endpoint' do
        expect(client).to receive(:post) do |&block|
          req = double('request')
          expect(req).to receive(:url).with(
            "#{Settings.skillvue.base_api_url}/v1/assessments/#{assessment.external_assessment_id}/users/Pm9xGP/report?format=json" # rubocop:disable Layout/LineLength
          )
          block.call(req)
          response
        end

        subject.call
      end
    end

    context 'when there is a network error' do
      let(:network_error) { Faraday::Error.new('Connection failed') }

      before do
        allow(client).to receive(:post).and_raise(network_error)
      end

      it 'captures the exception and broadcasts empty array' do
        expect(Sentry).to receive(:capture_exception).with(network_error, extra: {
          user_assessment_id: user_assessment.id,
          project_id: project.id
        })

        expect { subject.call }.to broadcast(:ok, [])
      end
    end

    context 'when there is a JSON parsing error' do
      before do
        allow(response).to receive(:body).and_return('invalid json')
      end

      it 'captures the exception and broadcasts empty array' do
        expect(Sentry).to receive(:capture_exception).with(instance_of(JSON::ParserError), extra: {
          user_assessment_id: user_assessment.id,
          project_id: project.id
        })

        expect { subject.call }.to broadcast(:ok, [])
      end
    end
  end
end
