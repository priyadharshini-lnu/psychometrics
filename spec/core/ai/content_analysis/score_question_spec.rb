# frozen_string_literal: true

require 'rails_helper'

describe AI::ContentAnalysis::ScoreQuestion do
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:users_result) { user_assessment.users_result }
  let(:ai_assistant) { create(:assistant) }
  let(:question) { create(:question, assessment: assessment) }
  let(:factor) { create(:factor, dimension: dimension) }

  before do
    assessment.update!(ai_assistant: ai_assistant)
    create(:factors_scoring, factor: factor, question: question)
  end

  def create_scoring_session
    create(
      :ai_question_scoring_session,
      assistable: question,
      resource: user_assessment,
      user: users_result.user
    )
  end

  def expect_session_status(session, status, error = nil)
    session.reload
    expect(session.status).to eq(status)
    expect(session.error).to eq(error) if error
  end

  describe '#call' do
    context 'when scoring session does not exist' do
      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: { 'factor_scores' => [] } })
      end

      it 'creates a new scoring session' do
        expect do
          described_class.call(question, users_result)
        end.to change(AI::QuestionScoringSession, :count).by(1)

        session = AI::QuestionScoringSession.last
        expect(session.assistable).to eq(question)
        expect(session.resource).to eq(user_assessment)
        expect(session.user).to eq(users_result.user)
      end
    end

    context 'when scoring session already exists' do
      let!(:existing_session) { create_scoring_session }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: { 'factor_scores' => [] } })
      end

      it 'uses the existing scoring session' do
        expect do
          described_class.call(question, users_result)
        end.not_to change(AI::QuestionScoringSession, :count)

        service = described_class.new(question, users_result)
        service.call
        expect(service.send(:session)).to eq(existing_session)
      end
    end

    context 'when rescore is false' do
      context 'and session has valid scores' do
        let!(:existing_session) do
          create_scoring_session.tap do |session|
            session.update!(
              checkpoint: { factor.id.to_s => { 'score' => 5 } },
              status: :completed,
              parsed_dependencies: 'dependencies'
            )
          end
        end

        before do
          allow_any_instance_of(AI::ContentAnalysis::PayloadParser).to receive(:dependencies).
            and_return('dependencies')
          allow(AI::AssistantService).to receive(:new).and_raise('Should not be called')
        end

        it 'returns existing scores without regenerating' do
          result = nil
          described_class.new(question, users_result, rescore: false).on(:ok) { |res| result = res }.call

          expect(result).to eq({ factor.id.to_s => { 'score' => 5 } })
        end
      end

      context 'and session is failed' do
        let!(:existing_session) do
          create_scoring_session.tap do |session|
            session.update!(status: :failed)
          end
        end

        it 'regenerates scores' do
          stub_wisper_publisher('AI::AssistantService', :call, :ok, {
            message: { 'factor_scores' => [{ 'factor_id' => factor.id, 'score' => 4 }] }
          })
          described_class.call(question, users_result)
          expect(existing_session.reload.status).to eq('completed')
          expect(existing_session.checkpoint).to eq({ factor.id.to_s => { 'score' => 4 } })
        end
      end

      context 'and dependencies have changed' do
        let!(:existing_session) do
          create_scoring_session.tap do |session|
            session.update!(
              checkpoint: { factor.id.to_s => { 'score' => 5 } },
              status: :completed,
              parsed_dependencies: 'old dependencies'
            )
          end
        end

        before do
          allow_any_instance_of(AI::ContentAnalysis::PayloadParser).to receive(:dependencies).
            and_return('new dependencies')
        end

        it 'regenerates scores' do
          stub_wisper_publisher('AI::AssistantService', :call, :ok, {
            message: { 'factor_scores' => [{ 'factor_id' => factor.id, 'score' => 4 }] }
          })
          described_class.call(question, users_result)
          expect(existing_session.reload.status).to eq('completed')
          expect(existing_session.checkpoint).to eq({ factor.id.to_s => { 'score' => 4 } })
        end
      end
    end

    context 'when rescore is true' do
      let!(:existing_session) do
        create_scoring_session.tap do |session|
          session.update!(
            checkpoint: { factor.id.to_s => { 'score' => 5 } },
            status: :completed,
            parsed_dependencies: 'dependencies'
          )
        end
      end

      it 'resets the session and regenerates scores' do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, {
          message: {
            'factor_scores' => [{ 'factor_id' => factor.id, 'score' => 4 }]
          }
        })
        described_class.call(question, users_result, rescore: true)

        expect(existing_session.reload.checkpoint).to eq({ factor.id.to_s => { 'score' => 4 } })
        expect(existing_session.status).to eq('completed')
        expect(existing_session.error).to be_nil
      end
    end

    context 'when AssistantService succeeds' do
      let!(:session) { create_scoring_session }
      let(:ai_response) do
        {
          'factor_scores' => [
            {
              'factor_id' => factor.id,
              'score' => 8,
              'rationale' => 'Good response'
            }
          ]
        }
      end

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: ai_response })
        allow_any_instance_of(AI::ContentAnalysis::PayloadParser).to receive(:dependencies).
          and_return('dependencies')
      end

      it 'marks session as completed and saves scores' do
        result = nil
        described_class.new(question, users_result).on(:ok) { |res| result = res }.call

        expect_session_status(session, 'completed')
        expect(session.reload.checkpoint).to eq({
          factor.id.to_s => {
            'score' => 8,
            'rationale' => 'Good response'
          }
        })
        expect(result).to eq({
          factor.id.to_s => {
            'score' => 8,
            'rationale' => 'Good response'
          }
        })
      end

      it 'saves parsed dependencies' do
        described_class.call(question, users_result)
        expect(session.reload.parsed_dependencies).to eq('dependencies')
      end

      it 'demonstrates the expected shape of AI response and parsed output' do
        mocked_raw_ai_message = {
          'factor_scores' => [
            {
              'factor_id' => '99',
              'score' => 5,
              'rationale' => 'Evidence found'
            }
          ]
        }

        expected_parsed_shape = {
          '99' => {
            'score' => 5,
            'rationale' => 'Evidence found'
          }
        }

        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: mocked_raw_ai_message })

        result = nil
        described_class.new(question, users_result).on(:ok) { |res| result = res }.call
        expect(result).to eq(expected_parsed_shape)
      end
    end

    context 'when AssistantService fails' do
      let!(:session) { create_scoring_session }

      before do
        stub_wisper_publisher('AI::AssistantService', :call, :error, 'AI service failed')
      end

      it 'marks session as failed and broadcasts error' do
        result = nil
        described_class.new(question, users_result).on(:error) { |err| result = err }.call

        expect_session_status(session, 'failed', 'AI service failed')
        expect(result).to eq('AI service failed')
      end
    end

    context 'when unexpected error occurs' do
      let!(:session) { create_scoring_session }

      before do
        allow_any_instance_of(described_class).to receive(:generate_scores!).
          and_raise(StandardError, 'Unexpected error')
      end

      it 'marks session as failed and broadcasts error' do
        result = nil
        described_class.new(question, users_result).on(:error) { |err| result = err }.call

        expect_session_status(session, 'failed')
        expect(session.reload.error).to include('Unexpected error')
        expect(result).to include('Unexpected error')
      end
    end

    context 'parsing AI response' do
      let(:service) { described_class.new(question, users_result) }

      it 'correctly parses valid factor scores' do
        response = {
          'factor_scores' => [
            { 'factor_id' => '1', 'score' => 7, 'rationale' => 'Test' }
          ]
        }

        parsed = service.send(:parse_ai_response, response)

        expect(parsed).to eq({
          '1' => { 'score' => 7, 'rationale' => 'Test' }
        })
      end

      it 'returns empty hash for invalid response structure' do
        parsed = service.send(:parse_ai_response, 'invalid')
        expect(parsed).to eq({})

        parsed = service.send(:parse_ai_response, { 'wrong' => 'structure' })
        expect(parsed).to eq({})
      end
    end
  end
end
