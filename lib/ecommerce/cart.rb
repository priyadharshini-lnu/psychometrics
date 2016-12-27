module Ecommerce
  class Cart
    attr_accessor :cart, :session

    def initialize(session)
      @session = session
      @cart = @session[:cart] || {}
    end

    # Add Item to cart
    def add(product_id, quantity = 1)
      return if quantity <= 0
      @cart[product_id.to_s] ||= { 'id' => product_id, 'quantity' => 0 }
      @cart[product_id.to_s]['quantity'] += quantity
      @session[:cart] = @cart
    end

    # Update quantity of specified item
    def update(product_id, quantity = 1)
      return remove(product_id) if quantity <= 0
      @cart[product_id.to_s] ||= { 'id' => product_id, 'quantity' => 0 }
      @cart[product_id.to_s]['quantity'] = quantity
      @session[:cart] = @cart
    end

    # Remove Item from cart
    def remove(product_id)
      @cart.delete(product_id.to_s)
      @session[:cart] = @cart
    end

    # Array of Item Ids
    def item_ids
      @cart.keys
    end

    # Return quantity for specified Item
    def quantity_for(product_id)
      @cart[product_id.to_s].try(:[], 'quantity').try(:to_i)
    end

    # Clear cart
    def clear!
      @cart = {}
      @session[:cart] = {}
    end
  end
end
