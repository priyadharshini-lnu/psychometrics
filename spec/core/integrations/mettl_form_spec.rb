# frozen_string_literal: true

require 'rails_helper'

describe Integrations::MettlForm do
  let(:attributes) do
    {
      name: 'mettl',
      api_base_url: 'https://api.mettl.com',
      active: true,
      private_key: 'private_key_sample',
      public_key: 'public_key_sample'
    }
  end

  let(:project) { create(:project) }

  it 'is valid if all valid attributes are passed' do
    form = described_class.new(attributes).with_context(project: project)

    expect(form.valid?).to eq(true)
  end

  it '#attributes is in correct format' do
    form = described_class.new(attributes).with_context(project: project)

    expect(form.attributes).to eq(
      {
        name: 'mettl',
        active: true,
        config: {
          api_base_url: 'https://api.mettl.com',
          private_key: Base64.encode64(Encryptor.encrypt(attributes[:private_key])),
          public_key: Base64.encode64(Encryptor.encrypt(attributes[:public_key]))
        }
      }
    )
  end

  it 'is invalid if private_key is not present' do
    form = described_class.new(attributes.merge(private_key: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:private_key]).to eq(["can't be blank"])
  end

  it 'is invalid if public_key is not present' do
    form = described_class.new(attributes.merge(public_key: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:public_key]).to eq(["can't be blank"])
  end

  it 'is invalid is mettl integration is already present for same project' do
    create(:integration, name: :mettl, project: project)
    form = described_class.new(attributes).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:name]).to eq(['This integration is already present for this project'])
  end

  describe '#unique_public_key' do
    it 'is invalid is same public key is already present for same different project' do
      create(:integration, name: :mettl, config: {
        private_key: Base64.encode64(Encryptor.encrypt(attributes[:private_key])),
        public_key: Base64.encode64(Encryptor.encrypt(attributes[:public_key]))
      })

      form = described_class.new(attributes).with_context(project: project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:base]).to eq(['Public key is already present in other project'])
    end
  end
end
