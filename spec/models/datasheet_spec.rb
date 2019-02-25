require 'rails_helper'

describe Datasheet, type: :model do
  it { should belong_to(:project).class_name('Client') }
  it { should have_many(:rows).class_name('DatasheetRow').inverse_of(:datasheet).dependent(:destroy) }
end
