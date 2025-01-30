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

    it 'passes all validation' do
      form = described_class.new(attributes)

      expect(form.valid?).to eq(true)
    end
  end
end
