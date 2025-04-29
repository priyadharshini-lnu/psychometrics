# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Skill::CreateContract do
  let(:project) { create(:project) }

  let(:valid_params) do
    jsonapi_resource_request(
      'skills',
      {
        name: 'Skill Name',
        category: 'Skill Category',
        description: 'Skill Description'
      },
      { project: { id: project.id.to_s, type: 'projects' } }
    )
  end

  it 'validates name if not already added' do
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(false)
  end

  it 'validates skill for project if not already added' do
    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(false)
  end

  it 'validates name for global skill if already added' do
    create(:skill, name: 'Skill Name', project_id: nil)

    params = valid_params.deep_merge(data: { relationships: { project: nil } })

    contract = described_class.new.call(params, {})

    expect(contract.failure?).to eq(true)
    expect(contract.errors[:data][:attributes][:name]).to include(
      I18n.t('dry_errors.errors.skill.already_added')
    )
  end

  it 'validates name for project skill if already added' do
    create(:skill, name: 'Skill Name', project_id: project.id)

    contract = described_class.new.call(valid_params, {})

    expect(contract.failure?).to eq(true)
    expect(contract.errors[:data][:attributes][:name]).to include(
      I18n.t('dry_errors.errors.skill.already_added')
    )
  end
end
