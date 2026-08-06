# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'HASHIDS_SALT rotation — EncodableId fallback' do
  # Use UsersResult as the test model — it includes EncodableId and
  # is representative of the import/export use case.
  let!(:record) { create(:users_result) }

  let(:current_salt) { ENV.fetch('HASHIDS_SALT', nil) }
  let(:new_salt)     { SecureRandom.hex(32) }

  # Encode with the current salt (simulates an export file generated before rotation).
  let(:encoded_id) { UsersResult.encode_id(record.id) }

  # Simulate rotating HASHIDS_SALT by stubbing ENV to return the new salt as
  # current and the old salt as PREV_HASHIDS_SALT.
  def with_rotated_salt(prev: current_salt, current: new_salt)
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('HASHIDS_SALT', nil).and_return(current)
    allow(ENV).to receive(:fetch).with('PREV_HASHIDS_SALT', '').and_return(prev)
    yield
  end

  describe 'encode_id' do
    it 'encodes the record id to a non-blank string' do
      expect(encoded_id).to be_present
    end

    it 'uses the current HASHIDS_SALT' do
      expect(encoded_id).to eq(
        Hashids.new(current_salt, Settings.hashids_length.default).encode(record.id)
      )
    end
  end

  describe 'decode_id after HASHIDS_SALT rotation' do
    it 'returns the correct id using PREV_HASHIDS_SALT fallback' do
      with_rotated_salt do
        expect(UsersResult.decode_id(encoded_id)).to eq([record.id])
      end
    end

    it 'find_by_encoded_id resolves the correct record via fallback' do
      with_rotated_salt do
        expect(UsersResult.find_by_encoded_id(encoded_id)).to eq(record) # rubocop:disable Rails/DynamicFindBy
      end
    end

    it 'encoded_id with new salt decodes without needing fallback' do
      with_rotated_salt do
        new_encoded = UsersResult.encode_id(record.id)
        expect(UsersResult.decode_id(new_encoded)).to eq([record.id])
      end
    end
  end

  describe 'PREV_HASHIDS_SALT is what enables the fallback' do
    it 'resolves the stale encoded id when PREV_HASHIDS_SALT is set' do
      with_rotated_salt(prev: current_salt, current: new_salt) do
        expect(UsersResult.decode_id(encoded_id)).to eq([record.id])
      end
    end

    it 'does not resolve via the new salt alone — the old encoded id is a different hash' do
      # Encode with the new salt — it produces a different string from the old one.
      new_encoded = Hashids.new(new_salt, Settings.hashids_length.default).encode(record.id)
      expect(new_encoded).not_to eq(encoded_id)
    end
  end

  describe 'MediaResponse encoded id fallback (import use case)' do
    let!(:media_record) { create(:media_response) }
    let(:encoded_media_id) { MediaResponse.encode_id(media_record.id) }

    it 'decode_id resolves via PREV_HASHIDS_SALT after rotation' do
      with_rotated_salt(prev: current_salt, current: new_salt) do
        expect(MediaResponse.decode_id(encoded_media_id)).to eq([media_record.id])
      end
    end

    it 'find_by_encoded_id finds the correct record via fallback' do
      with_rotated_salt(prev: current_salt, current: new_salt) do
        expect(MediaResponse.find_by_encoded_id(encoded_media_id)).to eq(media_record) # rubocop:disable Rails/DynamicFindBy
      end
    end
  end
end
