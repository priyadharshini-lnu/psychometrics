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
