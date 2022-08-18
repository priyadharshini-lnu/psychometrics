# frozen_string_literal: true

require 'rails_helper'

describe Examus::GetSession do
  it 'returns examus session details if present' do
    session_id = 'abc'
    token = 'token'
    session = { 'status' => 'started' }
    allow(Examus::JwtTokenizer).to receive(:encode).and_return(token)
    stub = stub_request(:get, "https://examus.net/api/v2/integration/simple/test/sessions/#{session_id}/status/").
           with(headers: { 'Content-Type' => 'application/json', 'Authorization' => "JWT #{token}" }).
           to_return({ body: session.to_json })
    result = described_class.call!(session_id)
    expect(stub).to have_been_requested
    expect(result).to eq(session)
  end

  it 'returns nil if examus session is nil' do
    session_id = 'abc'
    token = 'token'
    allow(Examus::JwtTokenizer).to receive(:encode).and_return(token)
    stub = stub_request(:get, "https://examus.net/api/v2/integration/simple/test/sessions/#{session_id}/status/").
           with(headers: { 'Content-Type' => 'application/json', 'Authorization' => "JWT #{token}" }).
           to_return({ status: 404 })
    result = described_class.call!(session_id)
    expect(stub).to have_been_requested
    expect(result).to eq(nil)
  end
end
