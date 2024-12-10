# frozen_string_literal: true

require 'rails_helper'

describe Norms::CopyNorm do
  let!(:norm) { create(:norm) }
  let!(:user) { create(:user) }

  it 'duplicates norm' do
    expect { described_class.call!(norm: norm, user: user) }.to change { Norm.count }.by(1)
    norm_count = Norm.where(name: "#{norm.name} (1)").count

    expect(norm_count).to eq(1)
  end

  it 'duplicates norm with new name' do
    new_norm_name = 'new_norm_name'
    expect do
      described_class.call!(norm: norm, user: user, new_norm_name: new_norm_name)
    end.to change { Norm.count }.by(1)
    norm_count = Norm.where(name: new_norm_name).count

    expect(norm_count).to eq(1)
  end

  it 'duplicates norm with new owner' do
    owner = create(:tenancy)
    expect { described_class.call!(norm: norm, user: user, owner_id: owner.id) }.to change { Norm.count }.by(1)
    norm_count = Norm.where(
      owner_id: owner.id
    ).count

    expect(norm_count).to eq(1)
  end
end
