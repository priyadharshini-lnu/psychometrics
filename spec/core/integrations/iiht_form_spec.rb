# frozen_string_literal: true

require 'rails_helper'

describe Integrations::IihtForm do
  let(:attributes) do
    {
      name: 'iiht',
      active: true,
      base_api_url: 'https://tte-iiht.com',
      company_id: 'company_id',
      company_name: 'company_name',
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

  it 'is invalid if base_api_url is not present' do
    form = described_class.new(attributes.merge(base_api_url: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:base_api_url]).to eq(["can't be blank"])
  end

  it 'is invalid if company_id is not present' do
    form = described_class.new(attributes.merge(company_id: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:company_id]).to eq(["can't be blank"])
  end

  it 'is invalid if company_name is not present' do
    form = described_class.new(attributes.merge(company_name: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:company_name]).to eq(["can't be blank"])
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

  it 'is invalid is base_api_url format is incorrect' do
    form = described_class.new(attributes.merge(base_api_url: 'abc')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:base_api_url]).to eq(
      ['Invalid URL. Specify the complete url with http or https protocol in it.']
    )
  end

  describe '#unique_company' do
    it 'when integration is not passed' do
      create(:integration, name: :iiht, config: attributes.slice(:company_id, :company_name))

      form = described_class.new(attributes).with_context(project: project)
      expect(form.valid?).to eq(false)
      expect(form.errors[:base]).to eq(['Company with this ID and name is already present in other project'])
    end

    it 'when integration is not passed' do
      integration = create(:integration, name: :iiht, config: { company_id: attributes[:company_id] })

      form = described_class.new(attributes).with_context(project: project, integration: integration)
      expect(form.valid?).to eq(true)
    end
  end
end
