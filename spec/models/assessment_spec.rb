# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Assessment, type: :model do
  it { should validate_presence_of(:type) }
  it { should validate_inclusion_of(:type).in_array(Assessment::TYPES.values) }
end
