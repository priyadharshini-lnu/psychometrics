# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::SavilleController, type: :controller do
  it 'calls SaveResultsAndReportsJob' do
    webhook_data = '{"assessment_id": "123", "user_id": "456", "results": {"score": 85}}'

    expect(Saville::SaveResultsAndReportsJob).to receive(:perform_later).with(webhook_data)

    post :results, body: webhook_data
  end
end
