# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Factor, type: :model do
  let(:dimension) { create(:dimension) }
  let!(:factor) { create(:factor, dimension: dimension) }
  let!(:sub_factor) { create(:factor, dimension: dimension) }
  let!(:factor_sub_factor) { create(:factors_sub_factor, factor: factor, sub_factor: sub_factor) }
  let(:image) do
    Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/images/test_image.jpeg'), 'image/jpeg')
  end

  describe '#child_factor_type' do
    it 'is nil by default when no sub_factors' do
      new_factor = create(:factor, dimension: dimension)
      expect(new_factor.child_factor_type).to be_nil
    end

    it 'syncs to indicator when indicator sub_factor is added' do
      parent = create(:factor, dimension: dimension)
      indicator = create(:factor, dimension: dimension, factor_type: :indicator)

      create(:factors_sub_factor, factor: parent, sub_factor: indicator)

      expect(parent.reload.child_factor_type).to eq('indicator')
    end

    it 'syncs to regular when regular sub_factor is added' do
      parent = create(:factor, dimension: dimension)
      regular_child = create(:factor, dimension: dimension, factor_type: :regular)

      create(:factors_sub_factor, factor: parent, sub_factor: regular_child)

      expect(parent.reload.child_factor_type).to eq('regular')
    end

    it 'resets to nil when all sub_factors are removed' do
      parent = create(:factor, dimension: dimension)
      indicator = create(:factor, dimension: dimension, factor_type: :indicator)
      fsf = create(:factors_sub_factor, factor: parent, sub_factor: indicator)

      expect(parent.reload.child_factor_type).to eq('indicator')

      fsf.destroy

      expect(parent.reload.child_factor_type).to be_nil
    end
  end

  context '#clone_and_save' do
    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
    end

    it 'should be copy all relative sub-factors' do
      cloned_factor = factor.clone_and_save
      expect(cloned_factor.sub_factors.count).to be 1
    end

    it 'copies images to new factor' do
      factor.icon.attach(image)
      cloned_factor = factor.clone_and_save
      expect(cloned_factor.icon).to be_attached
      expect(cloned_factor.icon.key).to eq cloned_factor.attachment_storage_path(
        :icon, factor.icon.blob.filename
      )
    end
  end

  it 'deletes record if related :dimension is deleted' do
    expect { factor.dimension.delete }.to change(described_class, :count).by(-2)
  end
end
