# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Taggable, type: :model do
  let!(:superadmin) { create(:superadmin) }
  let!(:assessment) { create(:assessment, category: 'psychometric') }

  before do
    set_current_user(superadmin)
  end

  describe '#update_tags_owner' do
    before do
      assessment.add_tag('psychometric')
      assessment.save
    end

    it 'updates tagger_id and tagger_type for taggings' do
      tagging = assessment.reload.taggings.last

      expect(tagging.tagger_id).to eq(superadmin.id)
      expect(tagging.tagger_type).to eq(superadmin.class.name)
    end
  end

  describe '#add_tag' do
    context 'when the tag exists' do
      before do
        assessment.add_tag('example_tag')
        assessment.save
        assessment.reload
      end

      it 'add the specific tag from the tag_list' do
        expect(assessment.all_tags_list).to include('example_tag')
      end
    end

    context 'when the tag does exist' do
      it 'does not raise an error' do
        expect do
          assessment.add_tag('non_existing_tag')
        end.not_to raise_error
      end
    end
  end

  describe '#remove_tag' do
    context 'when the tag exists' do
      before do
        assessment.add_tag('example_tag')
        assessment.save
        assessment.reload
      end

      it 'removes the specific tag from the tag_list' do
        assessment.remove_tag('example_tag')
        expect(assessment.all_tags_list).not_to include('example_tag')
      end
    end

    context 'when the tag does not exist' do
      it 'does not raise an error' do
        expect do
          assessment.remove_tag('non_existing_tag')
        end.not_to raise_error
      end
    end
  end
end
