# frozen_string_literal: true

class AddDigestDeliveryModeToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :report_approval_settings, :digest_delivery_mode, :string
  end
end
