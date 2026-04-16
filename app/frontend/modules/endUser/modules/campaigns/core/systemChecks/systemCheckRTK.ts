/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice } from '@reduxjs/toolkit'
import { FETCH } from '../campaigns'

type CampaignDetails = {
    id: number
    name: string
    isSystemCheckEnabled: boolean
    allowContinueWithWarning: boolean
    progressStatus: string
    scheduledAt: string | null
    scheduledIn: string | null
    type: string
    timing: number
    systemCheckValidity: number
    systemCheckStatus: {
      sessionId: string | null
      isValid: boolean
      requirements: {
        browser: { required: boolean }
        network: { required: boolean; minimumDownloadSpeed: number; minimumUploadSpeed: number }
        video: { required: boolean }
      }
    }
}

type CampaignOptions = {
  allowContinueWithWarning: boolean
  proctoringEnabled: boolean
}

type CampaignDetailsForSystemCheck = {
  campaignOptions: CampaignOptions
  campaignTime: number
  campaignUser: {
    id: number
  }
  campaignName: string
}

type CurrentCampaignForSystemCheck = CampaignDetailsForSystemCheck & {
    systemCheckSessionId: string | null
    checksArray: any[]
    isSystemCheckEnabled: boolean
    isSystemCheckCompleted: boolean
    systemCheckStatusPassed: boolean
    systemCheckValidity: number
    minimumDownloadSpeed: number
    minimumUploadSpeed: number
    requiredSystemChecks: string[]
  }

type SystemCheckState = {
  campaignList: Record<number, CampaignDetails>
  currentCampaignForSystemCheck: CurrentCampaignForSystemCheck | null
}

const defaultState: SystemCheckState = {
  campaignList: {},
  currentCampaignForSystemCheck: null,
}

const systemCheck = createSlice({
  name: 'systemCheck',
  initialState: defaultState,
  reducers: {

    setCampaignDetailsForSystemCheck (state, { payload }) {
      state.currentCampaignForSystemCheck = {
        campaignOptions: payload.campaignOptions,
        campaignTime: payload.campaignTime,
        campaignUser: payload.campaignUser,
        systemCheckSessionId: null,
        campaignName: payload.name,
        checksArray: [],
        isSystemCheckEnabled: false,
        isSystemCheckCompleted: false,
        systemCheckStatusPassed: true,
        systemCheckValidity: state.campaignList[payload.id]?.systemCheckValidity || 7200,
        minimumDownloadSpeed: 0,
        minimumUploadSpeed: 0,
        requiredSystemChecks: [],
      }
    },
    setChecksArray (state, { payload }) {
      state.currentCampaignForSystemCheck!.checksArray = state.currentCampaignForSystemCheck!.checksArray.concat(payload)
    },

    setSystemCheckSessionId (state, { payload }) {
      state.currentCampaignForSystemCheck!.systemCheckSessionId = payload
    },

    setIsSystemCheckEnabled (state, { payload }) {
      state.currentCampaignForSystemCheck!.isSystemCheckEnabled = payload
    },

    setSystemCheckStatusPassed (state, { payload }) {
      state.currentCampaignForSystemCheck!.systemCheckStatusPassed = state.currentCampaignForSystemCheck!.systemCheckStatusPassed && payload
    },

    setRequiredSystemChecks (state, { payload }) {
      state.currentCampaignForSystemCheck!.requiredSystemChecks = payload
    },

    setNetworkSpeeds (state, { payload }) {
      state.currentCampaignForSystemCheck!.minimumDownloadSpeed = payload.minimumDownloadSpeed
      state.currentCampaignForSystemCheck!.minimumUploadSpeed = payload.minimumUploadSpeed
    },
  },
  extraReducers: (builder) => {
    builder.addCase(FETCH, (state, action: any) => {
      action.response.forEach((campaign) => {
        state.campaignList[campaign.id] = { ...campaign }
      })
    })
  },
})

export const { actions } = systemCheck

export default systemCheck.reducer
