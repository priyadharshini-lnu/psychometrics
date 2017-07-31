module Ecommerce
  class CartsController < ::Ecommerce::BaseController
    def show
      @products = Product.
                  enabled.
                  with_price(current_currency.iso_code).
                  where(id: @cart.item_ids)
    end

    def update
      params[:cart]&.each do |product_id, cart_item|
        @cart.update(product_id, cart_item['quantity'].to_i)
      end

      redirect_to({ action: :show })
    end
  end
end
