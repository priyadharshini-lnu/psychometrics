# frozen_string_literal: true

require 'rails_helper'

describe Integrations::IihtForm do
  let(:attributes) do
    {
      name: 'iiht',
      active: true,
      tenant_id: 'tenant_id',
      tenancy_name: 'tenancy_name',
      user: 'user',
      password: 'password'
    }
  end
  let(:project) { create(:project) }

  it 'is valid if all valid attributes are passed' do
    form = described_class.new(attributes).with_context(project: project)

    expect(form.valid?).to eq(true)
  end

  it '#attributes is in correct format' do
    form = described_class.new(attributes).with_context(project: project)

    common_integration_attr = %i[name active]
    config = attributes.except(*common_integration_attr).merge(
      password: Base64.encode64(Encryptor.encrypt(attributes[:password]))
    )
    expect(form.attributes).to eq(
      attributes.slice(*common_integration_attr).merge(
        config: config
      )
    )
  end

  it 'sets password to passed integration password if password is not passed' do
    integration = create(:integration, config: { 'password' => 'password' })
    form = described_class.new(attributes.merge(password: '')).with_context(
      project: project, integration: integration
    )

    expect(
      form.attributes.dig(:config, :password)
    ).to eq(
      integration.config['password']
    )
  end

  it 'is invalid if tenant_id is not present' do
    form = described_class.new(attributes.merge(tenant_id: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:tenant_id]).to eq(["can't be blank"])
  end

  it 'is invalid if tenancy_name is not present' do
    form = described_class.new(attributes.merge(tenancy_name: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:tenancy_name]).to eq(["can't be blank"])
  end

  it 'is invalid if user is not present' do
    form = described_class.new(attributes.merge(user: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:user]).to eq(["can't be blank"])
  end

  it 'is invalid if password is not present' do
    form = described_class.new(attributes.merge(password: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:password]).to eq(["can't be blank"])
  end

  it 'is invalid is iiht integration is already present for same project' do
    create(:integration, name: :iiht, project: project)
    form = described_class.new(attributes).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:name]).to eq(['This integration is already present for this project'])
  end

  describe '#unique_tenant_id' do
    it 'when integration is not passed' do
      create(:integration, name: :iiht, config: attributes.slice(:tenant_id))

      form = described_class.new(attributes).with_context(project: project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:base]).to eq(['Tenant id is already present in other project'])
    end

    it 'when integration is not passed' do
      integration = create(:integration, name: :iiht, config: { tenant_id: attributes[:tenant_id] })

      form = described_class.new(attributes).with_context(project: project, integration: integration)
      expect(form.valid?).to eq(true)
    end
  end

  describe '#unique_tenancy_name' do
    it 'when integration is not passed' do
      create(:integration, name: :iiht, config: attributes.slice(:tenancy_name))

      form = described_class.new(attributes).with_context(project: project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:base]).to eq(['Tenancy name is already present in other project'])
    end

    it 'when integration is not passed' do
      integration = create(:integration, name: :iiht, config: { tenancy_name: attributes[:tenancy_name] })

      form = described_class.new(attributes).with_context(project: project, integration: integration)
      expect(form.valid?).to eq(true)
    end
  end
end
