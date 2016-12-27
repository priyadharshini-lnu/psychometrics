module Ecommerce
  class OrdersController < BaseController
    prepend_before_action :authenticate_user!
    before_action :ensure_current_membership
    before_action :find_products, only: [:new, :create]

    def new
    end

    def create
      @order = @current_membership.orders.build
      @products.each do |product|
        @order.purchases.build({
          product: product,
          price: product.price,
          quantity: @cart.quantity_for(product.id)
        })
      end
      @order.save
      @cart.clear!
      redirect_to success_ecommerce_orders_path
    end

    def success
      # TODO: Change when implement Payment Gateway
      @order = Order.includes(purchases: { product: { reports: :assessment } }).last

      @order.purchases.each do |purchase|
        purchase&.product&.reports.each do |report|
          AssessmentClient.find_or_create_by!({
            assessment: report&.assessment,
            client: @current_membership.client
          })
          ClientReport.find_or_create_by!({
            client: @current_membership.client,
            report: report
          })
          Assign.find_or_create_by(assessment: report&.assessment, membership: @current_membership)
        end
        @current_membership.client.increment!(:licenses, purchase.quantity)
        @order.completed!
      end
    end

    protected

    def find_products
      @products = Product.
                  enabled.
                  with_price(current_currency.iso_code).
                  where(id: @cart.item_ids)
    end

    def ensure_current_membership
      @current_membership = @current_user.memberships.includes(:client).find_or_initialize_by(is_retail: true)
      if @current_membership.new_record?
        @current_membership.client = Client.create(name: "Retail #{@current_user.decorate.display_name}", type: :retail)
        @current_membership.save
      end
    end
  end
end
