# frozen_string_literal: true

require 'rails_helper'

describe SamlSettings::Form do
  let(:attributes) { attributes_for(:saml_setting) }

  describe '#valid?' do
    it 'validates presence of mandatory fields' do
      form = described_class.new(attributes.merge(entity_id: nil, sso_service_url: nil, cert: nil))

      expect(form.valid?).to eq(false)
      expect(form.errors[:entity_id]).to eq(["can't be blank"])
      expect(form.errors[:sso_service_url]).to eq(["can't be blank"])
      expect(form.errors[:cert]).to eq(["can't be blank"])
    end

    it 'validates after_signout_url for correct url format' do
      form = described_class.new(attributes.merge(after_signout_url: 'google.com'))
      expect(form.valid?).to eq(false)
      expect(
        form.errors[:after_signout_url]
      ).to eq(['Invalid URL. Specify the complete url with http or https protocol in it.'])
    end

    it 'validate certificate' do
      form = described_class.new(attributes.merge(cert: 'invalid_cert'))

      expect(form.valid?).to eq(false)
      expect(form.errors[:cert]).to eq(['Invalid certificate'])
    end

    it 'passes all validation' do
      form = described_class.new(attributes)

      expect(form.valid?).to eq(true)
    end
  end
end
