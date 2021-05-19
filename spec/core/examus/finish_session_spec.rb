# frozen_string_literal: true

require 'rails_helper'

describe Examus::FinishSession do
  it 'calls examus finish session api' do
    session_id = 'abc'
    token = 'token'
    allow(Examus::JWTTokenizer).to receive(:encode).and_return(token)
    stub = stub_request(:post, "https://examus.net/api/v2/integration/simple/test/sessions/#{session_id}/finish/").
           with(headers: { 'Content-Type' => 'application/json', 'Authorization' => "JWT #{token}" })
    described_class.call!(session_id)
    expect(stub).to have_been_requested
  end
end
