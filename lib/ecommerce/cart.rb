module Ecommerce
  class Cart
    attr_accessor :cart, :session

    def initialize(engine)
      @engine = engine
      @cart = @engine[:cart] || {}
    end

    # Add Item to cart
    def add(product_id, quantity = 1)
      return if quantity <= 0
      @cart[product_id.to_s] ||= { 'id' => product_id, 'quantity' => 0 }
      @cart[product_id.to_s]['quantity'] += quantity
      @engine[:cart] = @cart
    end

    # Update quantity of specified item
    def update(product_id, quantity = 1)
      return remove(product_id) if quantity <= 0
      @cart[product_id.to_s] ||= { 'id' => product_id, 'quantity' => 0 }
      @cart[product_id.to_s]['quantity'] = quantity
      @engine[:cart] = @cart
    end

    # Remove Item from cart
    def remove(product_id)
      @cart.delete(product_id.to_s)
      @engine[:cart] = @cart
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
      @engine[:cart] = {}
    end
  end
end
