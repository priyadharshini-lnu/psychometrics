# frozen_string_literal: true

require 'rails_helper'

describe Integrations::MicrositeForm do
  let(:attributes) do
    {
      name: 'microsite',
      api_key: 'test-api-key',
      active: true
    }
  end

  let(:project) { create(:project) }
  let(:context) { { project: project, integration: nil } }

  describe 'validations' do
    it 'is invalid if api_key is not present' do
      form = described_class.new(attributes.merge(api_key: '')).with_context(project: project)

      expect(form).not_to be_valid
      expect(form.errors[:api_key]).to include("can't be blank")
    end

    it 'is invalid if name is not present' do
      form = described_class.new(attributes.merge(name: '')).with_context(project: project)

      expect(form).not_to be_valid
      expect(form.errors[:name]).to include("can't be blank")
    end
  end

  describe '#api_key' do
    let(:api_key) { 'secret-api-key' }

    it 'encrypts and Base64 encodes the API key' do
      allow(Encryptor).to receive(:encrypt).with(api_key).and_return('encrypted-api-key')
      allow(Base64).to receive(:encode64).with('encrypted-api-key').and_return('base64-encrypted-api-key')

      form = described_class.new(api_key: api_key, name: 'microsite')
      expect(form.api_key).to eq('base64-encrypted-api-key')
    end

    it 'does not encrypt if api_key is blank' do
      form = described_class.new(api_key: '', name: 'microsite')
      expect(form.api_key).to be_nil
    end
  end

  it 'is valid if all valid attributes are passed' do
    form = described_class.new(attributes).with_context(project: project)
    expect(form).to be_valid
  end

  it '#attributes is in correct format' do
    form = described_class.new(attributes).with_context(project: project)

    expect(form.attributes).to eq(
      {
        name: 'microsite',
        active: true,
        config: {
          api_key: Base64.encode64(Encryptor.encrypt(attributes[:api_key]))
        }
      }
    )
  end

  it 'supports setting integration as inactive' do
    inactive_attributes = attributes.merge(active: false)
    form = described_class.new(inactive_attributes).with_context(project: project)

    expect(form.attributes[:active]).to eq(false)
  end

  describe 'integration uniqueness' do
    it 'is invalid if microsite integration is already present for same project' do
      create(:integration, name: :microsite, project: project)
      form = described_class.new(attributes).with_context(project: project)

      expect(form).not_to be_valid
    end

    it 'allows updating the same integration' do
      existing_integration = create(:integration, name: :microsite, project: project)
      form = described_class.new(attributes).with_context(project: project, integration: existing_integration)

      expect(form).to be_valid
    end
  end

  describe 'unique_api_key validation' do
    let(:existing_integration) do
      create(:integration, name: :microsite, config: { api_key: Base64.encode64(Encryptor.encrypt('test-api-key')) })
    end

    it 'is invalid if api_key is already used by another microsite integration' do
      existing_integration
      form = described_class.new(attributes).with_context(project: project)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include(I18n.t('administration.integrations.validations.microsite.api_key_present'))
    end

    it 'allows using a different api_key even when other microsite integrations exist' do
      existing_integration
      new_attributes = attributes.merge(api_key: 'different-api-key')
      form = described_class.new(new_attributes).with_context(project: project)
      expect(form).to be_valid
    end
  end
end
