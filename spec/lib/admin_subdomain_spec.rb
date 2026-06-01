# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminSubdomain do
  before do
    allow(Settings).to receive(:subdomain).and_return('app')
    allow(Settings).to receive(:domain).and_return('tte.com')
    allow(Settings).to receive(:protocol).and_return('https')
  end

  describe '.client_prefix' do
    it 'returns nil for blank subdomain' do
      expect(described_class.client_prefix('')).to be_nil
    end

    it 'returns nil for root domain subdomain' do
      expect(described_class.client_prefix('app')).to be_nil
    end

    it 'extracts client prefix from admin subdomain' do
      expect(described_class.client_prefix('adnoc-admin')).to eq('adnoc-admin')
    end

    it 'extracts client prefix from end user subdomain' do
      expect(described_class.client_prefix('adnoc')).to eq('adnoc')
    end

    it 'strips nested subdomain parts' do
      expect(described_class.client_prefix('adnoc-admin.app')).to eq('adnoc-admin')
    end
  end

  describe '.client_admin?' do
    it 'returns true for admin subdomain' do
      expect(described_class.client_admin?('adnoc-admin')).to be true
    end

    it 'returns false for end user subdomain' do
      expect(described_class.client_admin?('adnoc')).to be false
    end

    it 'returns false for root domain' do
      expect(described_class.client_admin?('app')).to be false
    end

    it 'returns false for blank subdomain' do
      expect(described_class.client_admin?('')).to be false
    end
  end

  describe '.root_domain?' do
    it 'returns true for blank subdomain' do
      expect(described_class.root_domain?('')).to be true
    end

    it 'returns true for Settings.subdomain' do
      expect(described_class.root_domain?('app')).to be true
    end

    it 'returns false for client subdomain' do
      expect(described_class.root_domain?('adnoc-admin')).to be false
    end
  end

  describe '.end_user?' do
    it 'returns true for non-admin client subdomain' do
      expect(described_class.end_user?('adnoc')).to be true
    end

    it 'returns false for admin subdomain' do
      expect(described_class.end_user?('adnoc-admin')).to be false
    end

    it 'returns false for root domain' do
      expect(described_class.end_user?('app')).to be false
    end
  end

  describe '.client_subdomain_from_admin' do
    it 'extracts client subdomain from admin subdomain' do
      expect(described_class.client_subdomain_from_admin('adnoc-admin')).to eq('adnoc')
    end

    it 'returns nil for non-admin subdomain' do
      expect(described_class.client_subdomain_from_admin('adnoc')).to be_nil
    end
  end

  describe '.admin_url_for' do
    let(:client) { instance_double('Client', subdomain: 'adnoc') }

    before { allow(Settings).to receive(:port).and_return(nil) }

    it 'builds admin URL for client' do
      expect(described_class.admin_url_for(client)).to eq('https://adnoc-admin.tte.com/admin')
    end

    it 'builds admin URL with custom path' do
      expect(described_class.admin_url_for(client, path: '/dashboard')).to eq('https://adnoc-admin.tte.com/dashboard')
    end

    it 'builds admin URL with params' do
      url = described_class.admin_url_for(client, params: { token: 'abc123' })
      expect(url).to eq('https://adnoc-admin.tte.com/admin?token=abc123')
    end

    it 'includes port when configured' do
      allow(Settings).to receive(:port).and_return(3030)
      expect(described_class.admin_url_for(client)).to eq('https://adnoc-admin.tte.com:3030/admin')
    end
  end
end
