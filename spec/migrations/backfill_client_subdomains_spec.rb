# frozen_string_literal: true

require 'rails_helper'
require Rails.root.join('db/migrate/20260316160000_backfill_client_subdomains.rb')

describe BackfillClientSubdomains do
  subject(:migration) { described_class.new }

  describe '#reserved?' do
    it 'rejects reserved words' do
      %w[api assessment assessments report reports tte talent idp
         survey surveys user users campaign campaigns project projects].each do |word|
        expect(migration.send(:reserved?, word)).to be(true), "expected '#{word}' to be reserved"
      end
    end

    it 'rejects subdomains matching admin patterns' do
      expect(migration.send(:reserved?, 'admin')).to be true
      expect(migration.send(:reserved?, 'client-admin')).to be true
      expect(migration.send(:reserved?, 'client-admin-2')).to be true
    end

    it 'accepts valid subdomains' do
      expect(migration.send(:reserved?, 'acme')).to be false
      expect(migration.send(:reserved?, 'my-client')).to be false
    end
  end
end
