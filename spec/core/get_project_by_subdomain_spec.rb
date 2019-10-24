# frozen_string_literal: true

require 'rails_helper'

describe GetProjectBySubdomain do
  it 'returns nil if subdomain is nil' do
    result = described_class.call!(nil)

    expect(result).to eq(nil)
  end

  it 'returns nil if there is no project with the given subdomain' do
    result = described_class.call!('subdomain_name')

    expect(result).to eq(nil)
  end

  it 'replaces Settings.subdomain from subdomain before finding project' do
    allow(Settings).to receive(:subdomain).and_return('develop')
    project = create(:project, subdomain: 'tte')

    result = described_class.call!('tte.develop')

    expect(result).to eq(project)
  end

  it 'finds correct project when Settings.subdomain is nil' do
    allow(Settings).to receive(:subdomain).and_return(nil)
    project = create(:project, subdomain: 'tte')

    result = described_class.call!('tte')

    expect(result).to eq(project)
  end
end
