# frozen_string_literal: true

require 'rails_helper'

describe SecuritySettings::Form do
  let(:attributes) { attributes_for(:security_setting) }

  describe '#valid?' do
    it 'validates presence of mandatory fields' do
      form = described_class.new(attributes.merge(min_password_length: nil))

      expect(form.valid?).to eq(false)
      expect(form.errors[:min_password_length]).to eq(['is not a number'])
    end

    it 'validates fails when magic_link_expiry_in_seconds is less than 5 minutes' do
      form = described_class.new(attributes.merge(magic_link_expiry_in_seconds: 4.minutes.to_i))

      expect(form.valid?).to eq(false)
      expect(form.errors[:magic_link_expiry_in_seconds]).to eq(['Duration should be minimum 5 minutes'])
    end

    it 'validates fails when session_inactivity_timeout_in_seconds is less than 60 minutes' do
      form = described_class.new(attributes.merge(session_inactivity_timeout_in_seconds: 30.minutes.to_i))

      expect(form.valid?).to eq(false)
      expect(form.errors[:session_inactivity_timeout_in_seconds]).to eq(['Duration should be minimum 60 minutes'])
    end

    it 'validates fails when external_logout_redirect_enabled is true and external_logout_url is blank' do
      form = described_class.new(attributes.merge(external_logout_redirect_enabled: true, external_logout_url: nil))

      expect(form.valid?).to eq(false)
      expect(form.errors[:external_logout_url]).to include('can\'t be blank')
    end

    it 'passes validation when external_logout_redirect_enabled is true and external_logout_url is provided' do
      form = described_class.new(attributes.merge(external_logout_redirect_enabled: true, external_logout_url: 'https://example.com/logout'))

      expect(form.valid?).to eq(true)
    end

    it 'passes validation when external_logout_redirect_enabled is false and external_logout_url is blank' do
      form = described_class.new(attributes.merge(external_logout_redirect_enabled: false, external_logout_url: nil))

      expect(form.valid?).to eq(true)
    end

    it 'passes all validation' do
      form = described_class.new(attributes)

      expect(form.valid?).to eq(true)
    end
  end
end
