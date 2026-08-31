# frozen_string_literal: true

require 'rails_helper'

describe ActiveRecordAuditLogs::ScrubSensitiveData do
  describe '.call!' do
    subject(:result) { described_class.call!(audited_changes) }

    let(:audited_changes) do
      {
        'email' => ['old@example.com', 'new@example.com'],
        'mobile_number' => %w[1111111111 2222222222],
        'authentication_token' => %w[old-token new-token],
        'encrypted_api_key' => %w[old-key new-key],
        'idp_cert' => 'raw-cert',
        'ip_address' => ['10.0.0.1', '10.0.0.2'],
        'password' => %w[old-password new-password],
        'preferences' => {
          'token_encrypted' => 'encrypted-token',
          'nested' => { 'password_hint' => %w[before after] }
        },
        'secret_iv' => nil
      }
    end

    it 'masks sensitive values while preserving their keys' do
      expect(result).to eq(
        'email' => ['old@example.com', 'new@example.com'],
        'mobile_number' => %w[1111111111 2222222222],
        'authentication_token' => %w[**** ****],
        'encrypted_api_key' => %w[**** ****],
        'idp_cert' => '****',
        'ip_address' => ['10.0.0.1', '10.0.0.2'],
        'password' => %w[**** ****],
        'preferences' => {
          'token_encrypted' => '****',
          'nested' => { 'password_hint' => %w[**** ****] }
        },
        'secret_iv' => '****'
      )
    end
  end
end
