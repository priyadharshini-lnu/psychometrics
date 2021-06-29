# frozen_string_literal: true

require 'rails_helper'

describe Examus::IsSessionAlive do
  it 'returns true if session is already started' do
    session_id = 'abc'
    token = 'token'
    allow(Examus::JWTTokenizer).to receive(:encode).and_return(token)
    stub = stub_request(:get, "https://examus.net/api/v2/integration/simple/test/sessions/#{session_id}/status/").
           with(headers: { 'Content-Type' => 'application/json', 'Authorization' => "JWT #{token}" }).
           to_return({ body: { 'status' => 'started' }.to_json })
    result = described_class.call!(session_id)
    expect(stub).to have_been_requested
    expect(result).to eq(true)
  end

  it 'returns false if session is in finished state' do
    session_id = 'abc'
    token = 'token'
    allow(Examus::JWTTokenizer).to receive(:encode).and_return(token)
    stub = stub_request(:get, "https://examus.net/api/v2/integration/simple/test/sessions/#{session_id}/status/").
           with(headers: { 'Content-Type' => 'application/json', 'Authorization' => "JWT #{token}" }).
           to_return({ body: { 'status' => 'finished' }.to_json })
    result = described_class.call!(session_id)
    expect(stub).to have_been_requested
    expect(result).to eq(false)
  end
end
