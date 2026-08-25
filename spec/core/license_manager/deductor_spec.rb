# frozen_string_literal: true

require 'rails_helper'

describe LicenseManager::Deductor do
  let(:client) { create(:tenancy) }
  let(:project) { create(:client, parent: client, subdomain: 'test-subdomain') }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let(:report_family) { create(:report_family) }

  describe '#initialize' do
    context 'with valid parameters' do
      it 'initializes successfully' do
        report_family = create(:report_family)
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'common',
          context: { report_family_id: report_family.id }
        )

        expect(deductor.send(:campaign)).to eq(campaign)
        expect(deductor.send(:user)).to eq(user)
        expect(deductor.send(:license_type)).to eq('common')
        expect(deductor.send(:client)).to eq(client)
        expect(deductor.send(:project)).to eq(project)
      end
    end

    context 'with invalid license_type' do
      it 'raises ArgumentError' do
        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'invalid_type',
            context: {}
          )
        end.to raise_error(ArgumentError, /Invalid license_type/)
      end
    end

    context 'with common license type' do
      it 'requires report_family_id in context' do
        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'common',
            context: {}
          )
        end.to raise_error(ArgumentError, /report_family_id is required/)
      end

      it 'loads report_family from context' do
        report_family = create(:report_family)

        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'common',
          context: { report_family_id: report_family.id }
        )

        expect(deductor.send(:report_family)).to eq(report_family)
      end
    end

    context 'with idp license type' do
      it 'requires idp_plan in context' do
        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'idp',
            context: {}
          )
        end.to raise_error(ArgumentError, /idp_plan is required/)
      end

      it 'loads idp_plan from context' do
        user_idp_plan = create(:user_idp_plan)

        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'idp',
          context: { idp_plan: user_idp_plan }
        )

        expect(deductor.send(:user_idp_plan)).to eq(user_idp_plan)
      end
    end

    context 'with proctoring license type' do
      it 'initializes without additional context requirements' do
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'proctoring',
          context: {}
        )

        expect(deductor.send(:license_type)).to eq('proctoring')
      end
    end

    context 'with threesixty license type' do
      it 'initializes without additional context requirements' do
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'threesixty',
          context: {}
        )

        expect(deductor.send(:license_type)).to eq('threesixty')
      end
    end
  end

  describe '#call' do
    let(:report_family) { create(:report_family) }
    let(:license) { create(:license, type: 'common', client: client, report_family: report_family) }

    before do
      license.update(
        disabled: false,
        start_date: 10.days.ago,
        end_date: 10.days.from_now,
        number: 10,
        used_number: 0
      )
    end

    context 'when license is available' do
      it 'creates license_usage record' do
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'common',
          context: { report_family_id: report_family.id }
        )

        expect do
          deductor.call
        end.to change(LicenseUsage, :count).by(1)
      end
    end

    context 'when license is not available' do
      before do
        license.update(disabled: true)
      end

      it 'raises NotEnoughError with correct client and license name' do
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'common',
          context: { report_family_id: report_family.id }
        )

        expect do
          deductor.call
        end.to raise_error(Licenses::NotEnoughError) do |error|
          expect(error.message).to include(client.name)
          expect(error.message).to include(report_family.name)
        end
      end
    end

    context 'when report_family is already used by user' do
      before do
        create(:license_usage, campaign: campaign, user: user, client_id: client.id, license: license)
        # report_family.license_usages.create(campaign: campaign, user: user, client: client)
      end

      it 'returns existing usage without creating new record' do
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'common',
          context: { report_family_id: report_family.id }
        )

        expect do
          deductor.call
        end.not_to change(LicenseUsage, :count)
      end
    end

    context 'when user is marked as UAT' do
      let(:user) { create(:user, is_uat: true) }

      it 'does not create billable usage or increment used counts' do
        project_license = create(:project_license, license: license, project: project, enabled: true, used_number: 0)
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'common',
          context: { report_family_id: report_family.id }
        )

        expect { deductor.call }.not_to change(LicenseUsage, :count)
        expect(license.reload.used_number).to eq(0)
        expect(project_license.reload.used_number).to eq(0)
      end
    end
  end

  describe '#already_used?' do
    let(:report_family) { create(:report_family) }

    context 'with common license type' do
      context 'when user has usage for the campaign' do
        let(:license) { create(:license, type: 'common', client: client, report_family: report_family) }

        before do
          create(:license_usage, license: license, campaign: campaign, user: user, client: client)
        end

        it 'returns true' do
          deductor = described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'common',
            context: { report_family_id: report_family.id }
          )

          expect(deductor.already_used?).to be true
        end
      end

      context 'when user has no usage for the campaign' do
        it 'returns false' do
          deductor = described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'common',
            context: { report_family_id: report_family.id }
          )

          expect(deductor.already_used?).to be false
        end
      end
    end

    context 'with idp license type' do
      let(:user_idp_plan) { create(:user_idp_plan) }

      context 'when user has active idp license usage' do
        before do
          create(:license_usage, campaign: campaign, user: user, consumer: user_idp_plan, status: :active)
        end

        it 'returns true' do
          deductor = described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'idp',
            context: { idp_plan: user_idp_plan }
          )

          expect(deductor.already_used?).to be true
        end
      end

      context 'when idp license usage is inactive' do
        before do
          create(:license_usage, campaign: campaign, user: user, consumer: user_idp_plan, status: :inactive)
        end

        it 'returns false' do
          deductor = described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'idp',
            context: { idp_plan: user_idp_plan }
          )

          expect(deductor.already_used?).to be false
        end
      end

      context 'when user has no idp license usage' do
        it 'returns false' do
          deductor = described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'idp',
            context: { idp_plan: user_idp_plan }
          )

          expect(deductor.already_used?).to be false
        end
      end
    end

    context 'with proctoring license type' do
      it 'returns false' do
        deductor = described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'proctoring',
          context: {}
        )

        expect(deductor.already_used?).to be false
      end
    end
  end

  describe '#validate_license_type' do
    it 'raises error for invalid license type' do
      expect do
        described_class.new(
          campaign: campaign,
          user: user,
          license_type: 'nonexistent',
          context: {}
        )
      end.to raise_error(ArgumentError, /Invalid license_type/)
    end

    License.types.each_key do |license_type|
      context "with valid license type: #{license_type}" do
        it 'does not raise error' do
          report_family = create(:report_family) if license_type == 'common'
          user_idp_plan = create(:user_idp_plan) if license_type == 'idp'

          context_hash = case license_type
                           when 'common'
                             { report_family_id: report_family.id }
                           when 'idp'
                             { idp_plan: user_idp_plan }
                           else
                             {}
                         end

          expect do
            described_class.new(
              campaign: campaign,
              user: user,
              license_type: license_type,
              context: context_hash
            )
          end.not_to raise_error
        end
      end
    end
  end

  describe '#validate_context_keys' do
    context 'with common license type' do
      it 'requires report_family_id' do
        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'common',
            context: { some_other_key: 'value' }
          )
        end.to raise_error(ArgumentError, /report_family_id is required/)
      end

      it 'accepts report_family_id in context' do
        report_family = create(:report_family)

        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'common',
            context: { report_family_id: report_family.id }
          )
        end.not_to raise_error
      end
    end

    context 'with idp license type' do
      it 'requires idp_plan' do
        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'idp',
            context: { some_other_key: 'value' }
          )
        end.to raise_error(ArgumentError, /idp_plan is required/)
      end

      it 'accepts idp_plan in context' do
        user_idp_plan = create(:user_idp_plan)

        expect do
          described_class.new(
            campaign: campaign,
            user: user,
            license_type: 'idp',
            context: { idp_plan: user_idp_plan }
          )
        end.not_to raise_error
      end
    end

    context 'with proctoring or threesixty license type' do
      %w[proctoring threesixty].each do |type|
        it "accepts empty context for #{type}" do
          expect do
            described_class.new(
              campaign: campaign,
              user: user,
              license_type: type,
              context: {}
            )
          end.not_to raise_error
        end
      end
    end
  end

  describe '#get_license_usage_details' do
    let(:report_family) { create(:report_family) }
    let(:license1) do
      create(:license, type: 'common', client: client, report_family: report_family, number: 5, used_number: 5)
    end
    let(:license2) do
      create(:license, type: 'common', client: client, report_family: report_family, number: 10, used_number: 0)
    end

    before do
      license1.update(
        disabled: false,
        start_date: 10.days.ago,
        end_date: 10.days.from_now
      )

      license2.update(
        disabled: false,
        start_date: 10.days.ago,
        end_date: 10.days.from_now
      )
    end

    it 'tries licenses in order until one has availability' do
      deductor = described_class.new(
        campaign: campaign,
        user: user,
        license_type: 'common',
        context: { report_family_id: report_family.id }
      )

      result = deductor.send(:get_license_usage_details)

      expect(result).to be_present
      expect(result[:license]).to eq(license2)
    end

    it 'returns nil when no licenses are available' do
      license1.update(used_number: 5)
      license2.update(used_number: 10)

      deductor = described_class.new(
        campaign: campaign,
        user: user,
        license_type: 'common',
        context: { report_family_id: report_family.id }
      )

      result = deductor.send(:get_license_usage_details)

      expect(result).to be_nil
    end
  end
end
