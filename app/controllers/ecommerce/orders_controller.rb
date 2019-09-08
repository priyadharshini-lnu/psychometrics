# frozen_string_literal: true

module Ecommerce
  class OrdersController < BaseController
    prepend_before_action :authenticate_user!
    before_action :ensure_current_membership
    before_action :find_products, only: %i[new create]

    def new
      @order = @current_membership.orders.build
      @products.each do |product|
        @order.purchases.build(product: product,
                                 quantity: @cart.quantity_for(product.id),
                                 price_currency: current_currency.iso_code)
      end
    end

    def create
      @order = @current_membership.orders.new(order_params)
      respond_to do |format|
        if @order.save
          format.html do
            @cart.clear!
            redirect_to success_ecommerce_orders_path
          end
        else
          format.html { render :new }
        end
      end
    end

    def success
      # TODO: Change when implement Payment Gateway
      @order = Order.includes(purchases: [:invites, { product: { reports: :assessment } }]).last

      @order.purchases.each do |purchase|
        purchase&.product&.reports.each do |report|
          AssessmentClient.find_or_create_by!(
            assessment: report&.assessment,
            client: @current_membership.client
          )
          ClientReport.find_or_create_by!(
            client: @current_membership.client,
            report: report
          )
          # Invites specified users to assessment
          purchase.invites.each { |invite| invite_user(invite.email, report&.assessment) }
        end
        @current_membership.client&.increment!(:licenses, purchase.quantity)
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

    def order_params
      params.require(:ecommerce_order).permit(purchases_attributes: [:id, :product_id, :price_currency,
                                                                     :quantity, { invites_attributes: %i[id email] }])
    end

    # Method provide ability to create or update user
    # And assign assessment to him
    def invite_user(email, assessment)
      user = User.find_or_initialize_by(email: email)
      if user.new_record?
        user.assign_attributes(
          operator: current_user,
          role: 'Users::Member',
          memberships_attributes: [{
            client_id: @current_membership.client_id
          }]
        )
        user.save
        user.invite!(current_user, @current_membership.client_id)
      end
      membership = user.memberships.find_or_create_by(client_id: @current_membership.client_id)
      Assign.find_or_create_by!(membership: membership, assessment: assessment)
    end

    def ensure_current_membership
      @current_membership = @current_user.memberships.includes(:client).find_or_initialize_by(is_retail: true)
      if @current_membership.new_record?
        @current_membership.client = Client.create(name: "Retail #{@current_user.decorate.display_name}", type: :retail)
        @current_membership.save
        current_user.invite!(nil, @current_membership.client_id)
      end
    end
  end
end
