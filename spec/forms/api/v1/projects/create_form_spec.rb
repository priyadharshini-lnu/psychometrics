# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::Projects::CreateForm do
  let(:project) { create(:project) }

  it 'validates login_box_position' do
    form = described_class.new({ login_box_position: 'invalid' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:login_box_position]).to include('is not included in the list')
  end

  it 'validates background_color' do
    form = described_class.new({ background_color: 'invalid' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:background_color]).to include('must be a valid CSS hex color code')
  end

  it 'validates locales' do
    form = described_class.new({ locales: %w[en invalid] })

    expect(form.valid?).to eq(false)
    expect(form.errors[:locales]).to include('Invalid locale "invalid"')
  end

  it 'validates subdomain' do
    form = described_class.new({ subdomain: '34wrefd5c%4' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:subdomain]).to include('Wrong subdomain format')
  end

  it 'validates subdomain (uniq)' do
    create(:project, subdomain: 'dom')
    form = described_class.new({ subdomain: 'dom' })

    expect(form.valid?).to eq(false)
    expect(form.errors[:subdomain]).to include('Subdomain dom is already taken')
  end

  it 'validates passes if valid attributes are passed' do
    form = described_class.new({
      client_id: project.parent_id,
      subdomain: 'asd',
      locales: [],
      background_color: '#cccccc',
      login_box_position: 'right',
      name: 'project1',
      data_processing_consent: true,
      logo_alt_text: 'alt text',
      secondary_logo_alt_text: 'alt text'
    })

    expect(form.valid?).to eq(true)
  end
end
