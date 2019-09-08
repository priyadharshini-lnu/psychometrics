# frozen_string_literal: true

require 'rails_helper'
feature 'Products Page Test', type: :feature do
  let!(:product) { create(:product, :with_image, :with_prices) }

  scenario 'Able to see products list' do
    visit '/ecommerce'
    save_screenshot('test1.png')
  end
  scenario 'Able add a product to the cart' do
    visit '/ecommerce'
  end
  scenario 'Able change currency' do
  end
end
