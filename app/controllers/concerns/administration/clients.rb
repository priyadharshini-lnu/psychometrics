module Administration
  module Clients
    extend ActiveSupport::Concern

    included do
      before_action :ensure_not_root
    end

    private

    def ensure_not_root
      redirect_to administration_clients_path if client.root?
    end
  end
end
