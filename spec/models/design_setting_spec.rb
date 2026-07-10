# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DesignSetting, type: :model do
  describe 'associations' do
    it 'belongs to a root client' do
      tenancy = create(:tenancy)
      design_setting = tenancy.design_setting
      expect(design_setting.client).to eq(tenancy)
    end
  end

  describe 'default logo alt texts' do
    it 'sets logo_alt_text from the associated client name on create' do
      tenancy = create(:tenancy)
      expect(tenancy.design_setting.logo_alt_text).to eq(tenancy.name)
    end

    it 'sets secondary_logo_alt_text from the associated client name on create' do
      tenancy = create(:tenancy)
      expect(tenancy.design_setting.secondary_logo_alt_text).to eq(tenancy.name)
    end
  end
end
