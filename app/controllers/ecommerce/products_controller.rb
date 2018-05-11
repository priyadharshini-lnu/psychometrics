module Ecommerce
  class ProductsController < BaseController
    before_action :fetch_product, only: [:add_to_cart, :remove_from_cart]

    def index
      @products = Product.
                  enabled.
                  with_price(current_currency.iso_code).
                  order(id: :desc).
                  page(params[:page])
    end

    # Method for add Product to cart
    # POST, params: quantity
    def add_to_cart
      @cart.add(@product.id, (params[:quantity] || 1).to_i)
      respond_to do |format|
        format.html { redirect_back(fallback_location: root_path, success: 'Successfully') }
        format.js
      end
    end

    def remove_from_cart
      @cart.remove(@product.id)
    end

    private

    def fetch_product
      @product = Product.
                 enabled.
                 with_price(current_currency.iso_code).
                 find(params[:id])
    end
  end
end
