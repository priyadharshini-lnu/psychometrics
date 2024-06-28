# frozen_string_literal: true

require 'rails_helper'

describe Integrations::HoganForm do
  let(:attributes) do
    {
      name: 'hogan',
      active: true,
      provider: 'phoenix'
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

    config = attributes.except(*common_integration_attr)

    expect(form.attributes).to eq(
      attributes.slice(*common_integration_attr).merge(
        config: config
      )
    )
  end

  it 'is invalid if provider is not present' do
    form = described_class.new(attributes.merge(provider: '')).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:provider]).to eq(["can't be blank"])
  end

  it 'is invalid is hogan integration is already present for same project' do
    create(:integration, name: :hogan, project: project)
    form = described_class.new(attributes).with_context(project: project)

    expect(form.valid?).to eq(false)
    expect(form.errors[:name]).to eq(['This integration is already present for this project'])
  end
end
