# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InnovationStyle, type: :model do
  context 'Relations' do
    it { should belong_to(:dimension) }
  end

  context 'Validations' do
    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_most(150) }
  end
end
