# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Branches::AnswerFields::FileUpload do
  describe '.call' do
    let(:answers_pdf) do
      {
        '826' => {
          'answers' => [
            {
              'value' => 'https://lvh.me:3030/uploads/media_response/asset/prometeus.pdf'
            }
          ]
        }
      }
    end
    let(:answers_jpg) do
      {
        '826' => {
          'answers' => [
            {
              'value' => 'https://lvh.me:3030/uploads/media_response/asset/prometeus.jpg'
            }
          ]
        }
      }
    end

    it do
      response = described_class.call!(%w[FileUpload 826], { 'w' => '100px' }, answers: answers_pdf)
      expect(response).to eq("<iframe style='width: 100px; height: 400px;' src='https://docs.google.com/gview?\
url=https://lvh.me:3030/uploads/media_response/asset/prometeus.pdf&embedded=true'></iframe>")
    end

    it do
      response = described_class.call!(%w[FileUpload 826], {}, answers: answers_jpg)
      expect(response).to eq(nil)
    end
  end
end
