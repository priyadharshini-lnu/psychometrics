require 'rails_helper'
describe "the signin process", :type => :feature do

  it "signs me in" do
    visit '/administration/sign_in'
  end
end
