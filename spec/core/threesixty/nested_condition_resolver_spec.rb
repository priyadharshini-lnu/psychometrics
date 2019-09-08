# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NestedConditionResolver do
  describe '.check_results' do
    let(:resolver) { described_class.new([], proc {}) }

    it do
      results = []
      expect(resolver.check_results(results)).to be true
    end

    it do
      results = [{ operator: 'if', result: true }]
      expect(resolver.check_results(results)).to be true
    end

    it do
      results = [{ operator: 'if', result: true }, { operator: 'or', result: false }, { operator: 'or', result: true }]
      expect(resolver.check_results(results)).to be true
    end

    it do
      results = [{ operator: 'if', result: true }, { operator: 'and', result: false }]
      expect(resolver.check_results(results)).to be false
    end

    it do
      results = [{ operator: 'if', result: true }, { operator: 'and', result: true }]
      expect(resolver.check_results(results)).to be true
    end
    it do
      results = [{ operator: 'if', result: false }, { operator: 'or', result: true }, { operator: 'and', result: false }]
      expect(resolver.check_results(results)).to be false
    end
  end
end
