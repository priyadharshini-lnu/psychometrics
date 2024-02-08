# frozen_string_literal: true

require 'rails_helper'

describe DetectCyclicDependency do
  it 'returns false if there is no cyclic dependency' do
    dependency_hash = {
      'A' => %w[B],
      'B' => %w[C],
      'C' => %w[E F]
    }

    has_cycle, cycle = described_class.call!(dependency_hash)

    expect(has_cycle).to eq(false)
    expect(cycle).to eq([])
  end

  it 'returns true if there is cyclic dependency' do
    dependency_hash = {
      'A' => %w[B],
      'B' => %w[C],
      'C' => %w[E F],
      'F' => %w[A]
    }

    has_cycle, cycle = described_class.call!(dependency_hash)

    expect(has_cycle).to eq(true)
    expect(cycle).to eq(%w[A B C F A])
  end

  it 'handle returns first cyclic dependency if their are multiple dependencies' do
    dependency_hash = {
      'A' => %w[B],
      'B' => %w[C],
      'C' => %w[E F],
      'F' => %w[A],
      'E' => %w[D],
      'D' => %w[B]
    }

    has_cycle, cycle = described_class.call!(dependency_hash)

    expect(has_cycle).to eq(true)
    expect(cycle).to eq(%w[A B C E D B])
  end

  it 'handle cases where dependency list is empty' do
    dependency_hash = {
      'A' => [],
      'B' => [],
      'C' => [],
      'F' => %w[A]
    }

    has_cycle, cycle = described_class.call!(dependency_hash)

    expect(has_cycle).to eq(false)
    expect(cycle).to eq([])
  end
end
