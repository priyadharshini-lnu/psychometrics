require 'rails_helper'

RSpec.describe Factor, type: :model do
  let(:dimension) { create(:dimension) }
  let!(:factor) { create(:factor, :with_subfactor, dimension: dimension) }

  context '#clone_and_save' do
    it 'should be copy all relative sub-factors' do
      cloned_factor = factor.clone_and_save
      expect(cloned_factor.sub_factors.count).to be 1
    end
  end
end
