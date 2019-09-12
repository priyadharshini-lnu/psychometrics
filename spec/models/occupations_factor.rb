# frozen_string_literal: true

require 'rails_helper'

RSpec.describe OccupationsFactor, type: :model do
  context 'Relations' do
    it { should belong_to(:factor) }
    it { should belong_to(:occupation) }
  end

  context 'Validations' do
    it { should validate_presence_of(:predicate) }
    it { should validate_presence_of(:value) }
    it { should validate_numericality_of(:value).is_greater_than_or_equal_to(0).is_less_than_or_equal_to(5).allow_nil }
    it { should validate_numericality_of(:position).is_greater_than_or_equal_to(0) }
  end
end
