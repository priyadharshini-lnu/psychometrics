# frozen_string_literal: true

require 'rails_helper'

describe Norms::CopyNorm do
  let!(:norm) { create(:norm) }
  let!(:user) { create(:user) }

  it 'duplicates norm' do
    expect { described_class.call!(norm: norm, user: user, skip_owner_validation: true) }.to change { Norm.count }.by(1)
    norm_count = Norm.where(name: "#{norm.name} (1)").count

    expect(norm_count).to eq(1)
  end

  it 'duplicates norm with new name' do
    new_norm_name = 'new_norm_name'
    expect do
      described_class.call!(norm: norm, user: user, new_norm_name: new_norm_name, skip_owner_validation: true)
    end.to change { Norm.count }.by(1)
    norm_count = Norm.where(name: new_norm_name).count

    expect(norm_count).to eq(1)
  end

  it 'duplicates norm with new owner' do
    owner = create(:tenancy)
    expect do
      described_class.call!(norm: norm, user: user, owner_id: owner.id, skip_owner_validation: true)
    end.to change { Norm.count }.by(1)
    norm_count = Norm.where(
      owner_id: owner.id
    ).count

    expect(norm_count).to eq(1)
  end

  it 'copies norm with a different owner even when dimension owner differs' do
    source_owner = create(:tenancy)
    other_owner = create(:tenancy)
    dimension = create(:dimension, owner: source_owner)
    norm = create(:norm, owner: source_owner, dimension: dimension, skip_owner_validation: true)

    copied_norm = described_class.call!(
      norm: norm,
      user: user,
      owner_id: other_owner.id,
      skip_owner_validation: true
    )

    expect(copied_norm).to be_persisted
    expect(copied_norm.owner_id).to eq(other_owner.id)
  end
end
