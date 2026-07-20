# frozen_string_literal: true

RSpec.shared_examples 'raises authentication error' do
  it 'raises an authentication error' do
    expect { call_service }.to raise_error(described_class::AuthenticationError)
  end
end

RSpec.shared_examples 'raises authentication error with message' do |message|
  it 'raises an authentication error with the expected message' do
    expect { call_service }.to raise_error(described_class::AuthenticationError, message)
  end
end
