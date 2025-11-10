# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Lti::Oauth2AccessToken, type: :model do
  let(:project) { create(:project) }
  let(:scope) { 'https://purl.imsglobal.org/spec/lti-ags/scope/score' }

  # rubocop:disable Rails/DynamicFindBy
  describe '.create_token' do
    it 'creates a token record' do
      result = described_class.create_token(project_id: project.id, scope: scope)

      expect(result).to be_a(Hash)
      expect(result).to have_key(:raw_token)
      expect(result).to have_key(:token_record)
      expect(result).to have_key(:expires_in)
      expect(result).to have_key(:token_type)
    end

    it 'generates a hex token' do
      result = described_class.create_token(project_id: project.id, scope: scope)

      expect(result[:raw_token]).to be_a(String)
      expect(result[:raw_token].length).to eq(64)
      expect(result[:token_type]).to eq('Bearer')
    end

    it 'stores hashed version of token' do
      result = described_class.create_token(project_id: project.id, scope: scope)
      raw_token = result[:raw_token]
      token_record = result[:token_record]
      expected_hash = Digest::SHA256.hexdigest(raw_token)

      expect(token_record.token_hash).to eq(expected_hash)
    end
  end

  describe '.find_by_token' do
    it 'returns nil for blank token' do
      expect(described_class.find_by_token('')).to be_nil
      expect(described_class.find_by_token(nil)).to be_nil
    end

    it 'returns nil for non-existent token' do
      result = described_class.find_by_token('non_existent_token')
      expect(result).to be_nil
    end

    it 'uses SHA256 hash for lookup' do
      raw_token = 'test_token'
      expected_hash = Digest::SHA256.hexdigest(raw_token)

      token_record = create(:lti_oauth2_access_token,
                            token_hash: expected_hash,
                            project: project,
                            expires_at: 1.hour.from_now,
                            revoked: false)

      result = described_class.find_by_token(raw_token)
      expect(result).to eq(token_record)
    end
  end
  # rubocop:enable Rails/DynamicFindBy
end
