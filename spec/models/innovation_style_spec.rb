# frozen_string_literal: true

# == Schema Information
#
# Table name: innovation_styles
#
#  id          :bigint(8)        not null, primary key
#  name        :string
#  icon        :string
#  description :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

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
