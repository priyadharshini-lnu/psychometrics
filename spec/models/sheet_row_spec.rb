# frozen_string_literal: true

require 'rails_helper'

describe SheetRow, type: :model do
  it { should belong_to(:sheet).inverse_of(:rows) }
end
