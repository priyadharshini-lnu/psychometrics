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

    it 'passes all validation' do
      form = described_class.new(attributes)

      expect(form.valid?).to eq(true)
    end
  end
end
