# frozen_string_literal: true

require 'rails_helper'

describe BreadcrumbSerializer do
  describe '#to_hash' do
    it 'client and project' do
      data = described_class.new(
        only: %w[client project].map(&:to_sym),
        context: {
          fields: %w[client project]
        }
      ).serialize(
        {
          'client' => build(:client, id: 1, name: 'client'),
          'project' => build(:client, id: 2, name: 'project')
        }
      ).deep_symbolize_keys

      expect(data).to eq({ client: { id: 1, name: 'client' }, project: { id: 2, name: 'project' } })
    end

    it 'client and project, but fields=[client]' do
      data = described_class.new({
        only: ['client'].map(&:to_sym),
        context: {
          fields: ['client']
        }
      }).serialize(
        { 'client' => build(:client, id: 1, name: 'client'),
          'project' => build(:client, id: 2, name: 'project') }
      ).deep_symbolize_keys

      expect(data).to eq({ client: { id: 1, name: 'client' } })
    end

    it 'client and project and campaign, but fields=[client, campaign]' do
      data = described_class.new({
        only: %w[client campaign].map(&:to_sym),
        context: {
          fields: %w[client campaign]
        }
      }).serialize({
        'client' => build(:client, id: 1, name: 'client'),
        'project' => build(:client, id: 2, name: 'project'),
        'campaign' => build(:campaign, id: 3, name: 'campaign')
      }).deep_symbolize_keys

      expect(data).to eq({
        client: { id: 1, name: 'client' },
        campaign: { id: 3, name: 'campaign', tags: [] }
      })
    end

    it 'campaign with template tag' do
      data = described_class.new({
        only: %w[campaign].map(&:to_sym),
        context: {
          fields: %w[campaign]
        }
      }).serialize({
        'campaign' => build(:campaign, id: 3, name: 'campaign', is_template: true)
      }).deep_symbolize_keys

      expect(data).to eq({
        campaign: { id: 3, name: 'campaign', tags: ['template'] }
      })
    end
  end
end
