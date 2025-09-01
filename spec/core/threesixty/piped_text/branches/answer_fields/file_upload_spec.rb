# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::AnswerFields::FileUpload do
  describe '.call' do
    let(:result) { double }
    let(:media_response) { double }

    it 'pdf file' do
      allow(result).to receive_message_chain(:media_responses, :find_by) { media_response }
      allow(media_response).to receive_message_chain(:asset, :url) {
                                 'https://localhost:3030/uploads/media_response/asset/prometeus.pdf'
                               }
      response = described_class.call!(%w[FileUpload 826], { 'w' => '100px' }, result: result)
      expect(response).to eq(
        '<object style="width: 100px; height: 400px; background: black; border: none;" ' \
        'data="https://localhost:3030/uploads/media_response/asset/prometeus.pdf" type="application/pdf"></object>'
      )
    end

    it 'doc file' do
      allow(result).to receive_message_chain(:media_responses, :find_by) { media_response }
      allow(media_response).to receive_message_chain(:asset, :url) {
                                 'https://localhost:3030/uploads/media_response/asset/prometeus.doc'
                               }
      response = described_class.call!(%w[FileUpload 826], {}, result: result)
      expect(response).to eq(
        '<iframe style="width: 100%; height: 400px; background: black; border: none;" ' \
        'src="https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Flocalhost%3A3030%2Fuploads' \
        '%2Fmedia_response%2Fasset%2Fprometeus.doc"></iframe>'
      )
    end

    it 'no media_response' do
      allow(result).to receive_message_chain(:media_responses, :find_by) { nil }
      response = described_class.call!(%w[FileUpload 826], { 'w' => '100px' }, result: result)
      expect(response).to eq(nil)
    end

    it 'no asset in media_response' do
      allow(result).to receive_message_chain(:media_responses, :find_by) { media_response }
      allow(media_response).to receive(:asset).and_return nil
      response = described_class.call!(%w[FileUpload 826], { 'w' => '100px' }, result: result)
      expect(response).to eq(nil)
    end
  end
end
