# frozen_string_literal: true

require 'rails_helper'

describe Auth::ProjectConfigSerializer do
  let(:project) { create(:project) }
  let(:fallback_background) { 'https://example.com/bg.jpg' }

  subject(:result) do
    described_class.new(context: { background: fallback_background }).serialize(project.reload)
  end

  # Reads the attribute on its own; a bare object cannot go through the whole serializer.
  def glint_ui_for(object)
    described_class.new.tap { |serializer| serializer.instance_variable_set(:@object, object) }.glint_ui
  end

  describe 'glint_ui' do
    it 'is false when the project feature is off' do
      expect(result['glint_ui']).to be(false)
    end

    context 'when the project feature is on' do
      before { project.project_feature.update!(glint_ui: true) }

      it 'is true' do
        expect(result['glint_ui']).to be(true)
      end
    end

    # The devise layout serializes `@current_project || Client.new`, so the attribute is also
    # asked of objects that carry no project features.
    it 'is false for the project-less Client fallback' do
      expect(glint_ui_for(Client.new)).to be(false)
    end

    it 'is false for an object that does not respond to project_feature_enabled?' do
      expect(glint_ui_for(Object.new)).to be(false)
    end
  end
end
