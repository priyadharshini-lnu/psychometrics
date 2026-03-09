# frozen_string_literal: true

require 'rails_helper'

describe MediaResponses::CreateFromMediaUrl do
  subject(:command) { described_class.new(**params) }

  let(:user_result) { create(:users_result) }
  let(:block) { create(:block, assessment: user_result.assessment) }
  let(:question) { create(:question, type: 'VideoResponse', block: block) }
  let(:url) { 'https://example.com/media/video.webm' }
  let(:transcription_text) { 'Sample transcription text' }

  let(:params) do
    {
      url: url,
      user_result: user_result,
      question: question,
      transcription_text: transcription_text,
      user_selected: true
    }
  end

  let(:video_content) { 'fake video content' }

  before do
    stub_request(:get, url).to_return(status: 200, body: video_content) if url.present?
  end

  describe '#call' do
    context 'when url is blank' do
      let(:url) { '' }
      let(:params) do
        {
          url: '',
          user_result: user_result,
          question: question
        }
      end

      it 'does not create MediaResponse' do
        expect { command.call }.not_to change(MediaResponse, :count)
      end
    end

    context 'when user_result is blank' do
      let(:params) do
        {
          url: url,
          user_result: nil,
          question: question
        }
      end

      it 'does not create MediaResponse' do
        expect { command.call }.not_to change(MediaResponse, :count)
      end
    end

    context 'when question is blank' do
      let(:params) do
        {
          url: url,
          user_result: user_result,
          question: nil
        }
      end

      it 'does not create MediaResponse' do
        expect { command.call }.not_to change(MediaResponse, :count)
      end
    end

    context 'with valid parameters' do
      it 'creates a new MediaResponse' do
        expect { command.call }.to change(MediaResponse, :count).by(1)
      end

      it 'creates MediaResponse with correct attributes' do
        command.call
        media_response = MediaResponse.last
        expect(media_response.users_result).to eq(user_result)
        expect(media_response.question).to eq(question)
        expect(media_response.user_selected).to be true
      end

      it 'creates transcription when transcription_text provided' do
        expect { command.call }.to change(Transcription, :count).by(1)
        transcription = Transcription.last
        expect(transcription.text).to eq(transcription_text)
        expect(transcription.status).to eq('completed')
      end

      context 'without transcription_text' do
        let(:transcription_text) { nil }

        it 'does not create transcription' do
          expect { command.call }.not_to change(Transcription, :count)
        end
      end

      context 'when user_selected is false' do
        let(:params) do
          {
            url: url,
            user_result: user_result,
            question: question,
            user_selected: false
          }
        end

        before do
          # Create an initial media response so the callback doesn't auto-set user_selected=true
          create(:media_response, question: question, users_result: user_result)
        end

        it 'sets user_selected to false' do
          command.call
          media_response = MediaResponse.last
          expect(media_response.user_selected).to be false
        end
      end
    end

    context 'when download fails' do
      before do
        stub_request(:get, url).to_return(status: 404)
      end

      it 'does not create MediaResponse' do
        expect { command.call }.not_to change(MediaResponse, :count)
      end
    end
  end
end
