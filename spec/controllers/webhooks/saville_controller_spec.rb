# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::SavilleController, type: :controller do
  it 'calls SaveResultsAndReportsJob' do
    expect(Saville::SaveResultsAndReportsJob).to receive(:perform_later).with(controller.request.raw_post)

    post :results
  end
end
