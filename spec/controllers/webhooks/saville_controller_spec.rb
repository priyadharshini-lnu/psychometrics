# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::SavilleController, type: :controller do
  it 'calls SaveResultsAndReportsJob' do
    webhook_data = '{"assessment_id": "123", "user_id": "456", "results": {"score": 85}}'

    expect(Saville::SaveResultsAndReportsJob).to receive(:perform_later).with(webhook_data)

    post :results, body: webhook_data
  end

  it 'passes a String to SaveResultsAndReportsJob even when raw_post returns an IO::Stream::StringBuffer' do
    xml_string = '<AssessmentResult xmlns="http://ns.hr-xml.org/2007-04-15"></AssessmentResult>'
    io_stream_buffer = double('IO::Stream::StringBuffer', to_s: xml_string)

    allow_any_instance_of(ActionDispatch::Request).to receive(:raw_post).and_return(io_stream_buffer)

    expect(Saville::SaveResultsAndReportsJob).to receive(:perform_later).with(xml_string)

    post :results
  end
end
