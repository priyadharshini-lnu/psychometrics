# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NominationRequirements::IsValid do
  let(:conditions) do
    [
      { 'value' => 2, 'comparator' => 'atleast', 'relationship_id' => 5 },
      { 'value' => 3, 'comparator' => 'atleast', 'relationship_id' => 6 }
    ]
  end

  let(:nomination_requirement) { create(:threesixty_nomination_requirement, conditions: conditions) }

  it 'valid requirements' do
    expect(described_class.call!(nomination_requirement, 5 => 2, 6 => 4)).to eq true
  end

  it 'invalid requirements' do
    expect(described_class.call!(nomination_requirement, 5 => 1, 6 => 4)).to eq false
  end
end
