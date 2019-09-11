# frozen_string_literal: true

require 'rails_helper'

describe DatasheetRow, type: :model do
  it { should belong_to(:datasheet).inverse_of(:rows) }
end
