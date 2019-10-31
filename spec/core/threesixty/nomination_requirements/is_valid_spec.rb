# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NominationRequirements::IsValid do
  let(:conditions) do
    [
      { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 5 },
      { 'value' => '3', 'comparator' => 'atleast', 'relationship_id' => 6 }
    ]
  end

  let(:nomination_requirement) { create(:threesixty_nomination_requirement, conditions: conditions) }

  it 'valid requirements' do
    expect(described_class.call!(nomination_requirement, 5 => 2, 6 => 4)).to eq true
  end

  it 'invalid requirements' do
    expect(described_class.call!(nomination_requirement, 5 => 1, 6 => 4)).to eq false
  end

  context 'atmost' do
    it 'valid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [{ 'value' => '2', 'comparator' => 'atmost', 'relationship_id' => 5 }])
      expect(described_class.call!(nomination_requirement, 5 => 0)).to eq true

      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [{ 'value' => '2', 'comparator' => 'atmost', 'relationship_id' => 5 }])
      expect(described_class.call!(nomination_requirement, 5 => 2)).to eq true

      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [{ 'value' => '2', 'comparator' => 'atmost', 'relationship_id' => 5 }])
      expect(described_class.call!(nomination_requirement, 5 => 3)).to eq true
    end
  end

  context 'atleast' do
    it 'valid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 5 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 2)).to eq true

      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 5 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 3)).to eq true
    end

    it 'invalid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 5 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 1)).to eq false
    end
  end

  context 'exactly' do
    it 'valid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'exactly', 'relationship_id' => 5 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 2)).to eq true

      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'exactly', 'relationship_id' => 5 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 3)).to eq true
    end

    it 'invalid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'exactly', 'relationship_id' => 5 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 1)).to eq false
    end
  end

  context 'multiple conditions' do
    it 'valid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'exactly', 'relationship_id' => 5 },
                                       { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 6 },
                                       { 'value' => '2', 'comparator' => 'atmost', 'relationship_id' => 7 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 2, 6 => 3, 7 => 3)).to eq true
    end

    it 'invalid requirements' do
      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'exactly', 'relationship_id' => 5 },
                                       { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 6 },
                                       { 'value' => '2', 'comparator' => 'atmost', 'relationship_id' => 7 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 2, 6 => 1, 7 => 3)).to eq false

      nomination_requirement = build(:threesixty_nomination_requirement,
                                     conditions: [
                                       { 'value' => '2', 'comparator' => 'exactly', 'relationship_id' => 5 },
                                       { 'value' => '2', 'comparator' => 'atleast', 'relationship_id' => 6 },
                                       { 'value' => '2', 'comparator' => 'atmost', 'relationship_id' => 7 }
                                     ])
      expect(described_class.call!(nomination_requirement, 5 => 1, 6 => 2, 7 => 3)).to eq false
    end
  end
end
