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
    let(:answers_doc) do
      {
        '826' => {
          'answers' => [
            {
              'value' => 'https://lvh.me:3030/uploads/media_response/asset/prometeus.doc'
            }
          ]
        }
      }
    end

    it do
      response = described_class.call!(%w[FileUpload 826], { 'w' => '100px' }, answers: answers_pdf)
      expect(response).to eq("<object style='width: 100px; height: 400px; background: black; border: none;'\
 data='https://lvh.me:3030/uploads/media_response/asset/prometeus.pdf'></object>")
    end

    it do
      response = described_class.call!(%w[FileUpload 826], {}, answers: answers_doc)
      expect(response).to eq("<iframe style='width: 100%; height: 400px; background: black; border: none;'\
 src='https://view.officeapps.live.com/op/embed.aspx?src=https://lvh.me:3030/uploads/media_response/asset/prometeus.doc'\
></iframe>")
    end
  end
end
