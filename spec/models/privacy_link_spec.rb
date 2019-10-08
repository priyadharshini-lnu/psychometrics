# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PrivacyLink, type: :model do
  describe 'Validations' do
    it 'disallows empty text' do
      privacy_link = build(:privacy_link, text: '')
      expect(privacy_link.valid?).to eq(false)

      expect(privacy_link.errors[:text]).to include("can't be blank")
    end

    it 'disallows empty link' do
      privacy_link = build(:privacy_link, link: '')
      expect(privacy_link.valid?).to eq(false)

      expect(privacy_link.errors[:link]).to include("can't be blank")
    end

    it 'disallow url with different protocol apart from http/https' do
      privacy_link = build(:privacy_link, link: 'ftp://cc.com')
      expect(privacy_link.valid?).to eq(false)

      expect(privacy_link.errors[:link]).to include('invalid url')
    end

    it 'disallows invalid url' do
      privacy_link = build(:privacy_link, link: 'invalid')
      expect(privacy_link.valid?).to eq(false)

      expect(privacy_link.errors[:link]).to include('invalid url')
    end

    it 'allows url without subdomain' do
      privacy_link = build(:privacy_link, link: 'cc.com')

      expect(privacy_link.valid?).to eq(true)
    end

    it 'allows url with subdomain' do
      privacy_link = build(:privacy_link, link: 'subdomain.cc.com')

      expect(privacy_link.valid?).to eq(true)
    end

    it 'allows url with http/https in url' do
      privacy_link = build(:privacy_link, link: 'http://cc.com')
      expect(privacy_link.valid?).to eq(true)

      privacy_link = build(:privacy_link, link: 'https://cc.com')
      expect(privacy_link.valid?).to eq(true)
    end

    it 'allows url with subdomain and http/https in url' do
      privacy_link = build(:privacy_link, link: 'http://subdomain.cc.com')
      expect(privacy_link.valid?).to eq(true)

      privacy_link = build(:privacy_link, link: 'http://subdomain.cc.com')
      expect(privacy_link.valid?).to eq(true)
    end
  end
end
