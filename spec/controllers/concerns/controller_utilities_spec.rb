# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ControllerUtilities do
  let(:host_obj) do
    Class.new do
      include ControllerUtilities

      attr_accessor :request
      public :end_user_side?
    end.new
  end

  def end_user_side_for(subdomain)
    host_obj.request = double('request', subdomain: subdomain)
    host_obj.end_user_side?
  end

  describe '#end_user_side?' do
    it 'is false for the root/superadmin domain' do
      expect(end_user_side_for('')).to eq(false)
      expect(end_user_side_for(Settings.subdomain)).to eq(false)
    end

    it 'is true for a real client project subdomain' do
      %w[saib tenancy1 my-project acme-corp saudibank sa client123].each do |subdomain|
        expect(end_user_side_for(subdomain)).to eq(true), "expected #{subdomain.inspect} to be end_user_side"
      end
    end

    it 'is false for a client-admin subdomain' do
      expect(end_user_side_for('saib-admin')).to eq(false)
    end

    it 'never raises for edge-case subdomain values' do
      ['', 'a', 'a.b', '-admin', 'admin-'].each do |subdomain|
        expect { end_user_side_for(subdomain) }.not_to raise_error
      end
    end
  end
end
