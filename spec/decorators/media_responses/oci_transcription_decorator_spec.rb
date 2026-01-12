# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MediaResponses::OciTranscriptionDecorator do
  let(:media_response) { create(:media_response) }

  it 'generates a job name containing the media_response id' do
    job_name = described_class.job_name(media_response)
    expect(job_name).to include(media_response.id.to_s)
  end

  it 'extracts the media_response id from a job name' do
    job_name = described_class.job_name(media_response)
    extracted_id = described_class.media_response_id_from_job_name(job_name)
    expect(extracted_id).to eq(media_response.id.to_s)
  end

  it 'returns nil for invalid job name format' do
    expect(described_class.media_response_id_from_job_name('invalid_name')).to be_nil
  end
end
